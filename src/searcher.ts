import * as path from 'path';
import * as micromatch from 'micromatch';
import type { FileMetadata } from './indexer';

export interface SearchOptions {
    query: string;
    fileTypes?: string[];
    maxResults?: number;
    caseSensitive?: boolean;
    useRegex?: boolean;
    includeContext?: boolean;
}

export interface SearchResult {
    file: string;
    lineNumber: number;
    matchedLine: string;
    context?: string;
    score: number;
}

export class FileSearcher {
    private index: Map<string, FileMetadata>;

    constructor(index: Map<string, FileMetadata>) {
        this.index = index;
    }

    async searchCode(options: SearchOptions): Promise<SearchResult[]> {
        const results: SearchResult[] = [];
        const {
            query,
            fileTypes,
            maxResults = 20,
            caseSensitive = false,
            useRegex = false,
            includeContext = true,
        } = options;

        // Create search pattern
        let searchPattern: RegExp;
        try {
            if (useRegex) {
                searchPattern = new RegExp(query, caseSensitive ? 'g' : 'gi');
            } else {
                const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                searchPattern = new RegExp(escapedQuery, caseSensitive ? 'g' : 'gi');
            }
        } catch (error) {
            throw new Error(`Invalid search pattern: ${error}`);
        }

        // Search through indexed files
        for (const [filePath, metadata] of Array.from(this.index.entries())) {
            // Filter by file types if specified
            if (fileTypes && fileTypes.length > 0) {
                const fileExt = path.extname(filePath).slice(1).toLowerCase();
                if (!fileTypes.includes(fileExt)) {
                    continue;
                }
            }

            // Search within file content
            const fileResults = this.searchInFile(metadata, searchPattern, includeContext);
            results.push(...fileResults);

            // Stop if we have enough results
            if (results.length >= maxResults * 2) {
                break;
            }
        }

        // Sort by relevance score and limit results
        results.sort((a, b) => b.score - a.score);
        return results.slice(0, maxResults);
    }

    private searchInFile(metadata: FileMetadata, pattern: RegExp, includeContext: boolean): SearchResult[] {
        const results: SearchResult[] = [];
        const lines = metadata.content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const matches = Array.from(line.matchAll(pattern));

            if (matches.length > 0) {
                let context = '';
                if (includeContext) {
                    const contextLines = this.getContextLines(lines, i, 2);
                    context = contextLines.join('\n');
                }

                // Calculate relevance score
                const score = this.calculateRelevanceScore(line, matches, metadata);

                results.push({
                    file: metadata.relativePath,
                    lineNumber: i + 1,
                    matchedLine: line.trim(),
                    context: includeContext ? context : undefined,
                    score,
                });
            }
        }

        return results;
    }

    private getContextLines(lines: string[], targetLine: number, contextSize: number): string[] {
        const start = Math.max(0, targetLine - contextSize);
        const end = Math.min(lines.length, targetLine + contextSize + 1);

        const contextLines: string[] = [];
        for (let i = start; i < end; i++) {
            const prefix = i === targetLine ? '→ ' : '  ';
            const lineNumber = (i + 1).toString().padStart(3, ' ');
            contextLines.push(`${lineNumber}${prefix}${lines[i]}`);
        }

        return contextLines;
    }

    private calculateRelevanceScore(line: string, matches: RegExpMatchArray[], metadata: FileMetadata): number {
        let score = 0;

        // Base score for having matches
        score += matches.length * 10;

        // Boost score for exact matches
        score += matches.filter(match => match[0].length > 3).length * 5;

        // Boost score for matches in important file types
        const importantExtensions = ['.ts', '.js', '.tsx', '.jsx', '.py', '.java', '.cpp', '.go'];
        if (importantExtensions.some(ext => metadata.path.endsWith(ext))) {
            score += 5;
        }

        // Boost score for matches in function/class definitions
        if (line.includes('function') || line.includes('class') || line.includes('def ') || line.includes('interface')) {
            score += 15;
        }

        // Boost score for matches in comments (documentation)
        if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('#')) {
            score += 8;
        }

        // Penalty for very long lines (likely minified or generated code)
        if (line.length > 200) {
            score -= 10;
        }

        // Boost score for shorter file paths (likely more important files)
        const pathDepth = metadata.relativePath.split(path.sep).length;
        score += Math.max(0, 10 - pathDepth);

        return Math.max(0, score);
    }

    async findFiles(pattern: string, maxResults: number = 50): Promise<string[]> {
        const files: string[] = [];

        // Convert glob pattern to regex for more flexible matching
        const isGlobPattern = pattern.includes('*') || pattern.includes('?') || pattern.includes('[');

        for (const filePath of Array.from(this.index.keys())) {
            let matches = false;

            if (isGlobPattern) {
                // Use micromatch for glob pattern matching
                matches = micromatch.isMatch(filePath, pattern, { nocase: true });
            } else {
                // Simple substring matching for file names
                const fileName = path.basename(filePath);
                matches = fileName.toLowerCase().includes(pattern.toLowerCase()) ||
                    filePath.toLowerCase().includes(pattern.toLowerCase());
            }

            if (matches) {
                files.push(filePath);
                if (files.length >= maxResults) {
                    break;
                }
            }
        }

        // Sort by relevance (shorter paths first, then alphabetically)
        files.sort((a, b) => {
            const depthDiff = a.split(path.sep).length - b.split(path.sep).length;
            return depthDiff !== 0 ? depthDiff : a.localeCompare(b);
        });

        return files;
    }

    async findSymbols(symbolName: string, symbolType?: 'function' | 'class' | 'variable' | 'interface'): Promise<SearchResult[]> {
        const results: SearchResult[] = [];

        // Create patterns for different symbol types
        const patterns: Record<string, RegExp> = {
            function: new RegExp(`(?:function|def|fn)\\s+${symbolName}\\b`, 'gi'),
            class: new RegExp(`(?:class|interface)\\s+${symbolName}\\b`, 'gi'),
            variable: new RegExp(`(?:const|let|var|val)\\s+${symbolName}\\b`, 'gi'),
            interface: new RegExp(`interface\\s+${symbolName}\\b`, 'gi'),
        };

        const searchPatterns = symbolType
            ? [patterns[symbolType]].filter(Boolean)
            : Object.values(patterns);

        for (const [filePath, metadata] of Array.from(this.index.entries())) {
            for (const pattern of searchPatterns) {
                const fileResults = this.searchInFile(metadata, pattern, true);
                results.push(...fileResults);
            }
        }

        // Sort by relevance and remove duplicates
        const uniqueResults = results.filter((result, index, array) =>
            array.findIndex(r => r.file === result.file && r.lineNumber === result.lineNumber) === index
        );

        uniqueResults.sort((a, b) => b.score - a.score);
        return uniqueResults.slice(0, 50);
    }

    async findSimilarFiles(filePath: string, similarity: 'structure' | 'content' | 'imports'): Promise<Array<{ file: string; score: number }>> {
        const targetFile = this.index.get(filePath);
        if (!targetFile) {
            return [];
        }

        const results: Array<{ file: string; score: number }> = [];

        for (const [currentPath, metadata] of Array.from(this.index.entries())) {
            if (currentPath === filePath) continue;

            let score = 0;

            switch (similarity) {
                case 'structure':
                    score = this.calculateStructuralSimilarity(targetFile, metadata);
                    break;
                case 'content':
                    score = this.calculateContentSimilarity(targetFile, metadata);
                    break;
                case 'imports':
                    score = this.calculateImportSimilarity(targetFile, metadata);
                    break;
            }

            if (score > 0.1) { // Only include files with meaningful similarity
                results.push({ file: currentPath, score });
            }
        }

        results.sort((a, b) => b.score - a.score);
        return results.slice(0, 20);
    }

    private calculateStructuralSimilarity(file1: FileMetadata, file2: FileMetadata): number {
        // Compare file structure based on lines, language, and size
        let score = 0;

        // Same language
        if (file1.language === file2.language) {
            score += 0.3;
        }

        // Similar file size
        const sizeDiff = Math.abs(file1.size - file2.size) / Math.max(file1.size, file2.size);
        score += (1 - sizeDiff) * 0.2;

        // Similar line count
        const lineDiff = Math.abs(file1.lines - file2.lines) / Math.max(file1.lines, file2.lines);
        score += (1 - lineDiff) * 0.2;

        // Similar export count
        const exportDiff = Math.abs(file1.exports.length - file2.exports.length) /
            Math.max(file1.exports.length || 1, file2.exports.length || 1);
        score += (1 - exportDiff) * 0.3;

        return Math.min(1, score);
    }

    private calculateContentSimilarity(file1: FileMetadata, file2: FileMetadata): number {
        // Simple content similarity based on common words
        const words1 = new Set(file1.content.toLowerCase().split(/\W+/).filter(w => w.length > 3));
        const words2 = new Set(file2.content.toLowerCase().split(/\W+/).filter(w => w.length > 3));

        const intersection = new Set(Array.from(words1).filter(w => words2.has(w)));
        const union = new Set([...Array.from(words1), ...Array.from(words2)]);

        return intersection.size / union.size;
    }

    private calculateImportSimilarity(file1: FileMetadata, file2: FileMetadata): number {
        if (file1.dependencies.length === 0 && file2.dependencies.length === 0) {
            return 0;
        }

        const deps1 = new Set(file1.dependencies);
        const deps2 = new Set(file2.dependencies);

        const intersection = new Set(Array.from(deps1).filter(d => deps2.has(d)));
        const union = new Set([...Array.from(deps1), ...Array.from(deps2)]);

        return intersection.size / union.size;
    }

    getSearchStatistics(): {
        totalFiles: number;
        totalLines: number;
        averageFileSize: number;
        languageDistribution: Record<string, number>;
    } {
        let totalLines = 0;
        let totalSize = 0;
        const languages: Record<string, number> = {};

        for (const metadata of Array.from(this.index.values())) {
            totalLines += metadata.lines;
            totalSize += metadata.size;
            languages[metadata.language] = (languages[metadata.language] || 0) + 1;
        }

        return {
            totalFiles: this.index.size,
            totalLines,
            averageFileSize: this.index.size > 0 ? totalSize / this.index.size : 0,
            languageDistribution: languages,
        };
    }
}
