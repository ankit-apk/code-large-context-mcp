#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { RepositoryIndexer } from "./indexer";
import { FileSearcher } from "./searcher";

const server = new McpServer({
    name: "repo-indexer-mcp",
    version: "1.0.0",
});

// Global indexer and searcher instances
let indexer: RepositoryIndexer | null = null;
let searcher: FileSearcher | null = null;

// Initialize repository indexing
server.tool(
    "index-repository",
    "Index a repository for AI-assisted development. This scans all files, builds a searchable index, and creates dependency maps.",
    {
        repositoryPath: z.string().describe("Absolute path to the repository root directory"),
        includePatterns: z.array(z.string()).optional().describe("Glob patterns for files to include (default: all code files)"),
        excludePatterns: z.array(z.string()).optional().describe("Additional glob patterns for files to exclude"),
        maxFileSize: z.number().optional().describe("Maximum file size in KB to index (default: 1000KB)"),
        followSymlinks: z.boolean().optional().describe("Whether to follow symbolic links (default: false)"),
    },
    async ({ repositoryPath, includePatterns, excludePatterns, maxFileSize, followSymlinks }) => {
        try {
            indexer = new RepositoryIndexer({
                repositoryPath,
                includePatterns: includePatterns || [
                    "**/*.{js,jsx,ts,tsx,py,java,cpp,c,h,hpp,cs,php,rb,go,rs,swift,kt,scala,clj,ml,hs,elm,dart,lua,r,sql,sh,bash,zsh,fish,ps1,bat,cmd,md,txt,json,yaml,yml,xml,html,css,scss,sass,less,vue,svelte,astro}"
                ],
                excludePatterns: excludePatterns || [],
                maxFileSize: maxFileSize || 1000,
                followSymlinks: followSymlinks || false,
            });

            const stats = await indexer.indexRepository();
            searcher = new FileSearcher(indexer.getIndex());

            return {
                content: [
                    {
                        type: "text",
                        text: `Repository indexed successfully!\n\nStatistics:\n- Files indexed: ${stats.filesIndexed}\n- Total lines: ${stats.totalLines}\n- Languages detected: ${stats.languages.join(', ')}\n- Index size: ${(stats.indexSizeBytes / 1024 / 1024).toFixed(2)} MB\n\nYou can now use search-code, get-file-info, and other tools to explore the codebase.`,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error indexing repository: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
            };
        }
    }
);

// Search for code patterns
server.tool(
    "search-code",
    "Search for code patterns, functions, classes, or text across the indexed repository.",
    {
        query: z.string().describe("Search query (can be text, regex, or semantic description)"),
        fileTypes: z.array(z.string()).optional().describe("Filter by file extensions (e.g., ['js', 'ts'])"),
        maxResults: z.number().optional().describe("Maximum number of results to return (default: 20)"),
        caseSensitive: z.boolean().optional().describe("Case sensitive search (default: false)"),
        useRegex: z.boolean().optional().describe("Treat query as regular expression (default: false)"),
        includeContext: z.boolean().optional().describe("Include surrounding lines for context (default: true)"),
    },
    async ({ query, fileTypes, maxResults, caseSensitive, useRegex, includeContext }) => {
        try {
            if (!searcher) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Repository not indexed. Please run 'index-repository' first.",
                        },
                    ],
                };
            }

            const results = await searcher.searchCode({
                query,
                fileTypes,
                maxResults: maxResults || 20,
                caseSensitive: caseSensitive || false,
                useRegex: useRegex || false,
                includeContext: includeContext !== false,
            });

            if (results.length === 0) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `No results found for query: "${query}"`,
                        },
                    ],
                };
            }

            const formattedResults = results.map(result =>
                `📁 ${result.file} (line ${result.lineNumber})\n` +
                `${result.context ? result.context + '\n' : ''}` +
                `${result.matchedLine}\n` +
                `${'-'.repeat(50)}`
            ).join('\n\n');

            return {
                content: [
                    {
                        type: "text",
                        text: `Found ${results.length} results for "${query}":\n\n${formattedResults}`,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error searching code: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
            };
        }
    }
);

// Get file information and content
server.tool(
    "get-file-info",
    "Get detailed information about a specific file including content, dependencies, and metadata.",
    {
        filePath: z.string().describe("Relative path to the file from repository root"),
        includeContent: z.boolean().optional().describe("Include full file content (default: true)"),
        includeDependencies: z.boolean().optional().describe("Include file dependencies (default: true)"),
    },
    async ({ filePath, includeContent, includeDependencies }) => {
        try {
            if (!indexer) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Repository not indexed. Please run 'index-repository' first.",
                        },
                    ],
                };
            }

            const fileInfo = await indexer.getFileInfo(filePath, {
                includeContent: includeContent !== false,
                includeDependencies: includeDependencies !== false,
            });

            if (!fileInfo) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `File not found: ${filePath}`,
                        },
                    ],
                };
            }

            let result = `📄 File: ${fileInfo.path}\n`;
            result += `📊 Size: ${fileInfo.size} bytes\n`;
            result += `🗂️ Language: ${fileInfo.language}\n`;
            result += `📅 Last modified: ${fileInfo.lastModified}\n`;
            result += `📝 Lines: ${fileInfo.lines}\n`;

            if (fileInfo.dependencies && fileInfo.dependencies.length > 0) {
                result += `\n🔗 Dependencies:\n${fileInfo.dependencies.map(dep => `  - ${dep}`).join('\n')}\n`;
            }

            if (fileInfo.exports && fileInfo.exports.length > 0) {
                result += `\n📤 Exports:\n${fileInfo.exports.map(exp => `  - ${exp}`).join('\n')}\n`;
            }

            if (fileInfo.content && includeContent !== false) {
                result += `\n📋 Content:\n\`\`\`${fileInfo.language}\n${fileInfo.content}\n\`\`\``;
            }

            return {
                content: [
                    {
                        type: "text",
                        text: result,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error getting file info: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
            };
        }
    }
);

// Find files by name or pattern
server.tool(
    "find-files",
    "Find files by name or glob pattern in the indexed repository.",
    {
        pattern: z.string().describe("File name pattern or glob (e.g., '*.js', 'Component*', 'test/**/*.spec.ts')"),
        maxResults: z.number().optional().describe("Maximum number of results to return (default: 50)"),
    },
    async ({ pattern, maxResults }) => {
        try {
            if (!searcher) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Repository not indexed. Please run 'index-repository' first.",
                        },
                    ],
                };
            }

            const files = await searcher.findFiles(pattern, maxResults || 50);

            if (files.length === 0) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `No files found matching pattern: "${pattern}"`,
                        },
                    ],
                };
            }

            const fileList = files.map(file => `📄 ${file}`).join('\n');

            return {
                content: [
                    {
                        type: "text",
                        text: `Found ${files.length} files matching "${pattern}":\n\n${fileList}`,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error finding files: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
            };
        }
    }
);

// Get repository statistics and overview
server.tool(
    "get-repo-stats",
    "Get comprehensive statistics and overview of the indexed repository.",
    {},
    async () => {
        try {
            if (!indexer) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Repository not indexed. Please run 'index-repository' first.",
                        },
                    ],
                };
            }

            const stats = indexer.getRepositoryStats();

            let result = `📊 Repository Statistics\n`;
            result += `${'='.repeat(30)}\n\n`;
            result += `📁 Repository: ${stats.repositoryPath}\n`;
            result += `📄 Total files: ${stats.totalFiles}\n`;
            result += `📝 Total lines: ${stats.totalLines}\n`;
            result += `💾 Total size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB\n\n`;

            result += `🗂️ File types:\n`;
            Object.entries(stats.fileTypes).forEach(([ext, count]) => {
                result += `  ${ext}: ${count} files\n`;
            });

            result += `\n🌐 Languages:\n`;
            Object.entries(stats.languages).forEach(([lang, count]) => {
                result += `  ${lang}: ${count} files\n`;
            });

            if (stats.largestFiles && stats.largestFiles.length > 0) {
                result += `\n📈 Largest files:\n`;
                stats.largestFiles.slice(0, 5).forEach(file => {
                    result += `  ${file.path} (${(file.size / 1024).toFixed(1)} KB)\n`;
                });
            }

            return {
                content: [
                    {
                        type: "text",
                        text: result,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error getting repository stats: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
            };
        }
    }
);

// Get dependency graph
server.tool(
    "get-dependency-graph",
    "Get the dependency graph for a specific file or the entire repository.",
    {
        filePath: z.string().optional().describe("Specific file path (if not provided, returns global dependency overview)"),
        depth: z.number().optional().describe("Maximum depth for dependency traversal (default: 3)"),
        includeExternal: z.boolean().optional().describe("Include external/node_modules dependencies (default: false)"),
    },
    async ({ filePath, depth, includeExternal }) => {
        try {
            if (!indexer) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Repository not indexed. Please run 'index-repository' first.",
                        },
                    ],
                };
            }

            const dependencyGraph = await indexer.getDependencyGraph({
                filePath,
                depth: depth || 3,
                includeExternal: includeExternal || false,
            });

            let result = filePath
                ? `🔗 Dependency graph for ${filePath}\n`
                : `🔗 Repository dependency overview\n`;
            result += `${'='.repeat(40)}\n\n`;

            if (dependencyGraph.nodes.length === 0) {
                result += "No dependencies found.";
            } else {
                result += `📊 Summary:\n`;
                result += `  - Total files: ${dependencyGraph.nodes.length}\n`;
                result += `  - Total dependencies: ${dependencyGraph.edges.length}\n\n`;

                result += `🌐 Dependency tree:\n`;
                // Create a simple tree representation
                const tree = createDependencyTree(dependencyGraph);
                result += tree;
            }

            return {
                content: [
                    {
                        type: "text",
                        text: result,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error getting dependency graph: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
            };
        }
    }
);

function createDependencyTree(graph: { nodes: string[]; edges: Array<{ from: string; to: string }> }): string {
    const visited = new Set<string>();
    const result: string[] = [];

    function traverse(node: string, depth: number = 0, prefix: string = '') {
        if (visited.has(node) || depth > 5) return;
        visited.add(node);

        result.push(`${prefix}${depth > 0 ? '├── ' : ''}${node}`);

        const dependencies = graph.edges
            .filter(edge => edge.from === node)
            .map(edge => edge.to)
            .slice(0, 10); // Limit to avoid overwhelming output

        dependencies.forEach((dep, index) => {
            const isLast = index === dependencies.length - 1;
            const newPrefix = prefix + (depth > 0 ? (isLast ? '    ' : '│   ') : '');
            traverse(dep, depth + 1, newPrefix);
        });
    }

    // Start with root nodes (files that aren't dependencies of others)
    const rootNodes = graph.nodes.filter(node =>
        !graph.edges.some(edge => edge.to === node)
    ).slice(0, 10);

    if (rootNodes.length === 0) {
        // If no clear root nodes, start with first few nodes
        graph.nodes.slice(0, 5).forEach(node => traverse(node));
    } else {
        rootNodes.forEach(node => traverse(node));
    }

    return result.join('\n');
}

// Main server startup
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Repository Indexer MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
