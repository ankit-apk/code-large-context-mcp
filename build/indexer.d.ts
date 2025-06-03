export interface IndexerConfig {
    repositoryPath: string;
    includePatterns: string[];
    excludePatterns: string[];
    maxFileSize: number;
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
    largestFiles: Array<{
        path: string;
        size: number;
    }>;
}
export interface DependencyGraph {
    nodes: string[];
    edges: Array<{
        from: string;
        to: string;
        type: string;
    }>;
}
export declare class RepositoryIndexer {
    private config;
    private index;
    private gitignore;
    private watcher;
    constructor(config: IndexerConfig);
    indexRepository(): Promise<IndexStats>;
    private loadGitignore;
    private findFilesToIndex;
    private indexFile;
    private detectLanguage;
    private extractDependencies;
    private extractExports;
    private createHash;
    private calculateIndexSize;
    getIndex(): Map<string, FileMetadata>;
    getFileInfo(filePath: string, options?: {
        includeContent?: boolean;
        includeDependencies?: boolean;
    }): Promise<FileMetadata | null>;
    getRepositoryStats(): RepositoryStats;
    getDependencyGraph(options: {
        filePath?: string;
        depth?: number;
        includeExternal?: boolean;
    }): Promise<DependencyGraph>;
    private buildFileDepGraph;
    private getDependencyType;
    startWatching(callback: (event: 'add' | 'change' | 'unlink', filePath: string) => void): Promise<void>;
    stopWatching(): Promise<void>;
}
