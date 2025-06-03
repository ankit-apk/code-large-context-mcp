import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'fast-glob';
import ignore from 'ignore';
import * as chokidar from 'chokidar';

export interface IndexerConfig {
    repositoryPath: string;
    includePatterns: string[];
    excludePatterns: string[];
    maxFileSize: number; // in KB
    followSymlinks: boolean;
}

export interface FileMetadata {
    path: string;
    relativePath: string;
    size: number;
    lastModified: Date;
    language: string;
    lines: number;
    content: string;
    dependencies: string[];
    exports: string[];
    hash: string;
}

export interface IndexStats {
    filesIndexed: number;
    totalLines: number;
    languages: string[];
    indexSizeBytes: number;
}

export interface RepositoryStats {
    repositoryPath: string;
    totalFiles: number;
    totalLines: number;
    totalSize: number;
    fileTypes: Record<string, number>;
    languages: Record<string, number>;
    largestFiles: Array<{ path: string; size: number }>;
}

export interface DependencyGraph {
    nodes: string[];
    edges: Array<{ from: string; to: string; type: string }>;
}

export class RepositoryIndexer {
    private config: IndexerConfig;
    private index: Map<string, FileMetadata> = new Map();
    private gitignore: ReturnType<typeof ignore> | null = null;
    private watcher: chokidar.FSWatcher | null = null;

    constructor(config: IndexerConfig) {
        this.config = {
            ...config,
            repositoryPath: path.resolve(config.repositoryPath),
        };
    }

    async indexRepository(): Promise<IndexStats> {
        console.error(`Starting repository indexing: ${this.config.repositoryPath}`);

        // Load .gitignore if it exists
        await this.loadGitignore();

        // Clear existing index
        this.index.clear();

        // Find all files matching patterns
        const files = await this.findFilesToIndex();
        console.error(`Found ${files.length} files to index`);

        // Index each file
        let filesIndexed = 0;
        let totalLines = 0;
        const languages = new Set<string>();

        for (const file of files) {
            try {
                const metadata = await this.indexFile(file);
                if (metadata) {
                    this.index.set(metadata.relativePath, metadata);
                    filesIndexed++;
                    totalLines += metadata.lines;
                    languages.add(metadata.language);
                }
            } catch (error) {
                console.error(`Error indexing file ${file}:`, error);
            }
        }

        // Calculate index size
        const indexSizeBytes = this.calculateIndexSize();

        console.error(`Indexing complete: ${filesIndexed} files, ${totalLines} lines`);

        return {
            filesIndexed,
            totalLines,
            languages: Array.from(languages),
            indexSizeBytes,
        };
    }

    private async loadGitignore(): Promise<void> {
        const gitignorePath = path.join(this.config.repositoryPath, '.gitignore');

        try {
            if (await fs.pathExists(gitignorePath)) {
                const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
                this.gitignore = ignore().add(gitignoreContent);
            }
        } catch (error) {
            console.error('Error loading .gitignore:', error);
        }
    }

    private async findFilesToIndex(): Promise<string[]> {
        const patterns = this.config.includePatterns.map(pattern =>
            path.join(this.config.repositoryPath, pattern)
        );

        const excludePatterns = [
            '**/node_modules/**',
            '**/.git/**',
            '**/build/**',
            '**/dist/**',
            '**/.next/**',
            '**/.nuxt/**',
            '**/coverage/**',
            '**/.nyc_output/**',
            '**/target/**',
            '**/bin/**',
            '**/obj/**',
            '**/*.min.js',
            '**/*.min.css',
            '**/.DS_Store',
            '**/Thumbs.db',
            ...this.config.excludePatterns,
        ];

        const files = await glob(patterns, {
            ignore: excludePatterns,
            absolute: true,
            followSymbolicLinks: this.config.followSymlinks,
            onlyFiles: true,
        });

        // Filter through gitignore if available
        if (this.gitignore) {
            return files.filter(file => {
                const relativePath = path.relative(this.config.repositoryPath, file);
                return !this.gitignore!.ignores(relativePath);
            });
        }

        return files;
    }

    private async indexFile(filePath: string): Promise<FileMetadata | null> {
        try {
            const stats = await fs.stat(filePath);

            // Skip files that are too large
            if (stats.size > this.config.maxFileSize * 1024) {
                return null;
            }

            const relativePath = path.relative(this.config.repositoryPath, filePath);
            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.split('\n').length;
            const language = this.detectLanguage(filePath, content);

            // Extract dependencies and exports
            const dependencies = this.extractDependencies(content, language);
            const exports = this.extractExports(content, language);

            // Create a simple hash of the content
            const hash = this.createHash(content);

            return {
                path: filePath,
                relativePath,
                size: stats.size,
                lastModified: stats.mtime,
                language,
                lines,
                content,
                dependencies,
                exports,
                hash,
            };
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error);
            return null;
        }
    }

    private detectLanguage(filePath: string, content: string): string {
        const ext = path.extname(filePath).toLowerCase();

        const languageMap: Record<string, string> = {
            '.js': 'javascript',
            '.jsx': 'javascript',
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.py': 'python',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'c',
            '.h': 'c',
            '.hpp': 'cpp',
            '.cs': 'csharp',
            '.php': 'php',
            '.rb': 'ruby',
            '.go': 'go',
            '.rs': 'rust',
            '.swift': 'swift',
            '.kt': 'kotlin',
            '.scala': 'scala',
            '.clj': 'clojure',
            '.ml': 'ocaml',
            '.hs': 'haskell',
            '.elm': 'elm',
            '.dart': 'dart',
            '.lua': 'lua',
            '.r': 'r',
            '.sql': 'sql',
            '.sh': 'shell',
            '.bash': 'shell',
            '.zsh': 'shell',
            '.fish': 'shell',
            '.ps1': 'powershell',
            '.bat': 'batch',
            '.cmd': 'batch',
            '.md': 'markdown',
            '.txt': 'text',
            '.json': 'json',
            '.yaml': 'yaml',
            '.yml': 'yaml',
            '.xml': 'xml',
            '.html': 'html',
            '.css': 'css',
            '.scss': 'scss',
            '.sass': 'sass',
            '.less': 'less',
            '.vue': 'vue',
            '.svelte': 'svelte',
            '.astro': 'astro',
        };

        return languageMap[ext] || 'unknown';
    }

    private extractDependencies(content: string, language: string): string[] {
        const dependencies: Set<string> = new Set();

        // JavaScript/TypeScript imports
        if (language === 'javascript' || language === 'typescript') {
            const importRegex = /(?:import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]|require\s*\(\s*['"`]([^'"`]+)['"`]\s*\))/g;
            let match;
            while ((match = importRegex.exec(content)) !== null) {
                dependencies.add(match[1] || match[2]);
            }
        }

        // Python imports
        if (language === 'python') {
            const importRegex = /(?:from\s+(\S+)\s+import|import\s+(\S+))/g;
            let match;
            while ((match = importRegex.exec(content)) !== null) {
                dependencies.add(match[1] || match[2]);
            }
        }

        // Java imports
        if (language === 'java') {
            const importRegex = /import\s+(?:static\s+)?([^;]+);/g;
            let match;
            while ((match = importRegex.exec(content)) !== null) {
                dependencies.add(match[1]);
            }
        }

        // Go imports
        if (language === 'go') {
            const importRegex = /import\s+(?:\(\s*)?["']([^"']+)["']/g;
            let match;
            while ((match = importRegex.exec(content)) !== null) {
                dependencies.add(match[1]);
            }
        }

        return Array.from(dependencies);
    }

    private extractExports(content: string, language: string): string[] {
        const exports: Set<string> = new Set();

        // JavaScript/TypeScript exports
        if (language === 'javascript' || language === 'typescript') {
            const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type|enum)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
            let match;
            while ((match = exportRegex.exec(content)) !== null) {
                exports.add(match[1]);
            }

            // Named exports
            const namedExportRegex = /export\s*\{\s*([^}]+)\s*\}/g;
            while ((match = namedExportRegex.exec(content)) !== null) {
                const names = match[1].split(',').map(name => name.trim().split(' as ')[0].trim());
                names.forEach(name => exports.add(name));
            }
        }

        // Python exports (functions and classes at module level)
        if (language === 'python') {
            const exportRegex = /^(?:def|class)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gm;
            let match;
            while ((match = exportRegex.exec(content)) !== null) {
                if (!match[1].startsWith('_')) { // Exclude private functions/classes
                    exports.add(match[1]);
                }
            }
        }

        // Java public classes/methods
        if (language === 'java') {
            const exportRegex = /public\s+(?:class|interface|enum)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
            let match;
            while ((match = exportRegex.exec(content)) !== null) {
                exports.add(match[1]);
            }
        }

        return Array.from(exports);
    }

    private createHash(content: string): string {
        // Simple hash function for content change detection
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }

    private calculateIndexSize(): number {
        let size = 0;
        for (const metadata of Array.from(this.index.values())) {
            size += JSON.stringify(metadata).length;
        }
        return size;
    }

    getIndex(): Map<string, FileMetadata> {
        return this.index;
    }

    async getFileInfo(filePath: string, options: { includeContent?: boolean; includeDependencies?: boolean } = {}): Promise<FileMetadata | null> {
        const metadata = this.index.get(filePath);
        if (!metadata) {
            return null;
        }

        const result = { ...metadata };

        if (options.includeContent === false) {
            result.content = '';
        }

        if (options.includeDependencies === false) {
            result.dependencies = [];
        }

        return result;
    }

    getRepositoryStats(): RepositoryStats {
        const fileTypes: Record<string, number> = {};
        const languages: Record<string, number> = {};
        let totalLines = 0;
        let totalSize = 0;
        const largestFiles: Array<{ path: string; size: number }> = [];

        for (const metadata of Array.from(this.index.values())) {
            const ext = path.extname(metadata.path).toLowerCase() || 'no-extension';
            fileTypes[ext] = (fileTypes[ext] || 0) + 1;
            languages[metadata.language] = (languages[metadata.language] || 0) + 1;
            totalLines += metadata.lines;
            totalSize += metadata.size;
            largestFiles.push({ path: metadata.relativePath, size: metadata.size });
        }

        largestFiles.sort((a, b) => b.size - a.size);

        return {
            repositoryPath: this.config.repositoryPath,
            totalFiles: this.index.size,
            totalLines,
            totalSize,
            fileTypes,
            languages,
            largestFiles: largestFiles.slice(0, 10),
        };
    }

    async getDependencyGraph(options: { filePath?: string; depth?: number; includeExternal?: boolean }): Promise<DependencyGraph> {
        const nodes: Set<string> = new Set();
        const edges: Array<{ from: string; to: string; type: string }> = [];

        if (options.filePath) {
            // Build dependency graph for a specific file
            await this.buildFileDepGraph(options.filePath, nodes, edges, options.depth || 3, 0, options.includeExternal || false);
        } else {
            // Build global dependency overview
            for (const metadata of Array.from(this.index.values())) {
                nodes.add(metadata.relativePath);

                for (const dep of metadata.dependencies) {
                    if (options.includeExternal || this.index.has(dep)) {
                        edges.push({
                            from: metadata.relativePath,
                            to: dep,
                            type: this.getDependencyType(dep),
                        });
                    }
                }
            }
        }

        return {
            nodes: Array.from(nodes),
            edges,
        };
    }

    private async buildFileDepGraph(
        filePath: string,
        nodes: Set<string>,
        edges: Array<{ from: string; to: string; type: string }>,
        maxDepth: number,
        currentDepth: number,
        includeExternal: boolean
    ): Promise<void> {
        if (currentDepth >= maxDepth || nodes.has(filePath)) {
            return;
        }

        const metadata = this.index.get(filePath);
        if (!metadata) {
            return;
        }

        nodes.add(filePath);

        for (const dep of metadata.dependencies) {
            if (includeExternal || this.index.has(dep)) {
                edges.push({
                    from: filePath,
                    to: dep,
                    type: this.getDependencyType(dep),
                });

                if (this.index.has(dep)) {
                    await this.buildFileDepGraph(dep, nodes, edges, maxDepth, currentDepth + 1, includeExternal);
                }
            }
        }
    }

    private getDependencyType(dependency: string): string {
        if (dependency.startsWith('.') || dependency.startsWith('/')) {
            return 'relative';
        }
        if (dependency.includes('node_modules') || !this.index.has(dependency)) {
            return 'external';
        }
        return 'internal';
    }

    async startWatching(callback: (event: 'add' | 'change' | 'unlink', filePath: string) => void): Promise<void> {
        if (this.watcher) {
            await this.watcher.close();
        }

        this.watcher = chokidar.watch(this.config.repositoryPath, {
            ignored: [
                '**/node_modules/**',
                '**/.git/**',
                '**/build/**',
                '**/dist/**',
            ],
            persistent: true,
            followSymlinks: this.config.followSymlinks,
        });

        this.watcher.on('add', filePath => callback('add', filePath));
        this.watcher.on('change', filePath => callback('change', filePath));
        this.watcher.on('unlink', filePath => callback('unlink', filePath));
    }

    async stopWatching(): Promise<void> {
        if (this.watcher) {
            await this.watcher.close();
            this.watcher = null;
        }
    }
}
