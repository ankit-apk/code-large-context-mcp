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
export declare class FileSearcher {
    private index;
    constructor(index: Map<string, FileMetadata>);
    searchCode(options: SearchOptions): Promise<SearchResult[]>;
    private searchInFile;
    private getContextLines;
    private calculateRelevanceScore;
    findFiles(pattern: string, maxResults?: number): Promise<string[]>;
    findSymbols(symbolName: string, symbolType?: 'function' | 'class' | 'variable' | 'interface'): Promise<SearchResult[]>;
    findSimilarFiles(filePath: string, similarity: 'structure' | 'content' | 'imports'): Promise<Array<{
        file: string;
        score: number;
    }>>;
    private calculateStructuralSimilarity;
    private calculateContentSimilarity;
    private calculateImportSimilarity;
    getSearchStatistics(): {
        totalFiles: number;
        totalLines: number;
        averageFileSize: number;
        languageDistribution: Record<string, number>;
    };
}
