#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var zod_1 = require("zod");
var indexer_1 = require("./indexer");
var searcher_1 = require("./searcher");
var server = new mcp_js_1.McpServer({
    name: "repo-indexer-mcp",
    version: "1.0.0",
});
// Global indexer and searcher instances
var indexer = null;
var searcher = null;
// Initialize repository indexing
server.tool("index-repository", "Index a repository for AI-assisted development. This scans all files, builds a searchable index, and creates dependency maps.", {
    repositoryPath: zod_1.z.string().describe("Absolute path to the repository root directory"),
    includePatterns: zod_1.z.array(zod_1.z.string()).optional().describe("Glob patterns for files to include (default: all code files)"),
    excludePatterns: zod_1.z.array(zod_1.z.string()).optional().describe("Additional glob patterns for files to exclude"),
    maxFileSize: zod_1.z.number().optional().describe("Maximum file size in KB to index (default: 1000KB)"),
    followSymlinks: zod_1.z.boolean().optional().describe("Whether to follow symbolic links (default: false)"),
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var stats, error_1;
    var repositoryPath = _b.repositoryPath, includePatterns = _b.includePatterns, excludePatterns = _b.excludePatterns, maxFileSize = _b.maxFileSize, followSymlinks = _b.followSymlinks;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                indexer = new indexer_1.RepositoryIndexer({
                    repositoryPath: repositoryPath,
                    includePatterns: includePatterns || [
                        "**/*.{js,jsx,ts,tsx,py,java,cpp,c,h,hpp,cs,php,rb,go,rs,swift,kt,scala,clj,ml,hs,elm,dart,lua,r,sql,sh,bash,zsh,fish,ps1,bat,cmd,md,txt,json,yaml,yml,xml,html,css,scss,sass,less,vue,svelte,astro}"
                    ],
                    excludePatterns: excludePatterns || [],
                    maxFileSize: maxFileSize || 1000,
                    followSymlinks: followSymlinks || false,
                });
                return [4 /*yield*/, indexer.indexRepository()];
            case 1:
                stats = _c.sent();
                searcher = new searcher_1.FileSearcher(indexer.getIndex());
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "Repository indexed successfully!\n\nStatistics:\n- Files indexed: ".concat(stats.filesIndexed, "\n- Total lines: ").concat(stats.totalLines, "\n- Languages detected: ").concat(stats.languages.join(', '), "\n- Index size: ").concat((stats.indexSizeBytes / 1024 / 1024).toFixed(2), " MB\n\nYou can now use search-code, get-file-info, and other tools to explore the codebase."),
                            },
                        ],
                    }];
            case 2:
                error_1 = _c.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "Error indexing repository: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)),
                            },
                        ],
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Search for code patterns
server.tool("search-code", "Search for code patterns, functions, classes, or text across the indexed repository.", {
    query: zod_1.z.string().describe("Search query (can be text, regex, or semantic description)"),
    fileTypes: zod_1.z.array(zod_1.z.string()).optional().describe("Filter by file extensions (e.g., ['js', 'ts'])"),
    maxResults: zod_1.z.number().optional().describe("Maximum number of results to return (default: 20)"),
    caseSensitive: zod_1.z.boolean().optional().describe("Case sensitive search (default: false)"),
    useRegex: zod_1.z.boolean().optional().describe("Treat query as regular expression (default: false)"),
    includeContext: zod_1.z.boolean().optional().describe("Include surrounding lines for context (default: true)"),
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var results, formattedResults, error_2;
    var query = _b.query, fileTypes = _b.fileTypes, maxResults = _b.maxResults, caseSensitive = _b.caseSensitive, useRegex = _b.useRegex, includeContext = _b.includeContext;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                if (!searcher) {
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: "Repository not indexed. Please run 'index-repository' first.",
                                },
                            ],
                        }];
                }
                return [4 /*yield*/, searcher.searchCode({
                        query: query,
                        fileTypes: fileTypes,
                        maxResults: maxResults || 20,
                        caseSensitive: caseSensitive || false,
                        useRegex: useRegex || false,
                        includeContext: includeContext !== false,
                    })];
            case 1:
                results = _c.sent();
                if (results.length === 0) {
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: "No results found for query: \"".concat(query, "\""),
                                },
                            ],
                        }];
                }
                formattedResults = results.map(function (result) {
                    return "\uD83D\uDCC1 ".concat(result.file, " (line ").concat(result.lineNumber, ")\n") +
                        "".concat(result.context ? result.context + '\n' : '') +
                        "".concat(result.matchedLine, "\n") +
                        "".concat('-'.repeat(50));
                }).join('\n\n');
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "Found ".concat(results.length, " results for \"").concat(query, "\":\n\n").concat(formattedResults),
                            },
                        ],
                    }];
            case 2:
                error_2 = _c.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "Error searching code: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)),
                            },
                        ],
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get file information and content
server.tool("get-file-info", "Get detailed information about a specific file including content, dependencies, and metadata.", {
    filePath: zod_1.z.string().describe("Relative path to the file from repository root"),
    includeContent: zod_1.z.boolean().optional().describe("Include full file content (default: true)"),
    includeDependencies: zod_1.z.boolean().optional().describe("Include file dependencies (default: true)"),
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var fileInfo, result, error_3;
    var filePath = _b.filePath, includeContent = _b.includeContent, includeDependencies = _b.includeDependencies;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                if (!indexer) {
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: "Repository not indexed. Please run 'index-repository' first.",
                                },
                            ],
                        }];
                }
                return [4 /*yield*/, indexer.getFileInfo(filePath, {
                        includeContent: includeContent !== false,
                        includeDependencies: includeDependencies !== false,
                    })];
            case 1:
                fileInfo = _c.sent();
                if (!fileInfo) {
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: "File not found: ".concat(filePath),
                                },
                            ],
                        }];
                }
                result = "\uD83D\uDCC4 File: ".concat(fileInfo.path, "\n");
                result += "\uD83D\uDCCA Size: ".concat(fileInfo.size, " bytes\n");
                result += "\uD83D\uDDC2\uFE0F Language: ".concat(fileInfo.language, "\n");
                result += "\uD83D\uDCC5 Last modified: ".concat(fileInfo.lastModified, "\n");
                result += "\uD83D\uDCDD Lines: ".concat(fileInfo.lines, "\n");
                if (fileInfo.dependencies && fileInfo.dependencies.length > 0) {
                    result += "\n\uD83D\uDD17 Dependencies:\n".concat(fileInfo.dependencies.map(function (dep) { return "  - ".concat(dep); }).join('\n'), "\n");
                }
                if (fileInfo.exports && fileInfo.exports.length > 0) {
                    result += "\n\uD83D\uDCE4 Exports:\n".concat(fileInfo.exports.map(function (exp) { return "  - ".concat(exp); }).join('\n'), "\n");
                }
                if (fileInfo.content && includeContent !== false) {
                    result += "\n\uD83D\uDCCB Content:\n```".concat(fileInfo.language, "\n").concat(fileInfo.content, "\n```");
                }
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: result,
                            },
                        ],
                    }];
            case 2:
                error_3 = _c.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "Error getting file info: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)),
                            },
                        ],
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Find files by name or pattern
server.tool("find-files", "Find files by name or glob pattern in the indexed repository.", {
    pattern: zod_1.z.string().describe("File name pattern or glob (e.g., '*.js', 'Component*', 'test/**/*.spec.ts')"),
    maxResults: zod_1.z.number().optional().describe("Maximum number of results to return (default: 50)"),
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var files, fileList, error_4;
    var pattern = _b.pattern, maxResults = _b.maxResults;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                if (!searcher) {
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: "Repository not indexed. Please run 'index-repository' first.",
                                },
                            ],
                        }];
                }
                return [4 /*yield*/, searcher.findFiles(pattern, maxResults || 50)];
            case 1:
                files = _c.sent();
                if (files.length === 0) {
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: "No files found matching pattern: \"".concat(pattern, "\""),
                                },
                            ],
                        }];
                }
                fileList = files.map(function (file) { return "\uD83D\uDCC4 ".concat(file); }).join('\n');
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "Found ".concat(files.length, " files matching \"").concat(pattern, "\":\n\n").concat(fileList),
                            },
                        ],
                    }];
            case 2:
                error_4 = _c.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "Error finding files: ".concat(error_4 instanceof Error ? error_4.message : String(error_4)),
                            },
                        ],
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get repository statistics and overview
server.tool("get-repo-stats", "Get comprehensive statistics and overview of the indexed repository.", {}, function () { return __awaiter(void 0, void 0, void 0, function () {
    var stats, result_1;
    return __generator(this, function (_a) {
        try {
            if (!indexer) {
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "Repository not indexed. Please run 'index-repository' first.",
                            },
                        ],
                    }];
            }
            stats = indexer.getRepositoryStats();
            result_1 = "\uD83D\uDCCA Repository Statistics\n";
            result_1 += "".concat('='.repeat(30), "\n\n");
            result_1 += "\uD83D\uDCC1 Repository: ".concat(stats.repositoryPath, "\n");
            result_1 += "\uD83D\uDCC4 Total files: ".concat(stats.totalFiles, "\n");
            result_1 += "\uD83D\uDCDD Total lines: ".concat(stats.totalLines, "\n");
            result_1 += "\uD83D\uDCBE Total size: ".concat((stats.totalSize / 1024 / 1024).toFixed(2), " MB\n\n");
            result_1 += "\uD83D\uDDC2\uFE0F File types:\n";
            Object.entries(stats.fileTypes).forEach(function (_a) {
                var ext = _a[0], count = _a[1];
                result_1 += "  ".concat(ext, ": ").concat(count, " files\n");
            });
            result_1 += "\n\uD83C\uDF10 Languages:\n";
            Object.entries(stats.languages).forEach(function (_a) {
                var lang = _a[0], count = _a[1];
                result_1 += "  ".concat(lang, ": ").concat(count, " files\n");
            });
            if (stats.largestFiles && stats.largestFiles.length > 0) {
                result_1 += "\n\uD83D\uDCC8 Largest files:\n";
                stats.largestFiles.slice(0, 5).forEach(function (file) {
                    result_1 += "  ".concat(file.path, " (").concat((file.size / 1024).toFixed(1), " KB)\n");
                });
            }
            return [2 /*return*/, {
                    content: [
                        {
                            type: "text",
                            text: result_1,
                        },
                    ],
                }];
        }
        catch (error) {
            return [2 /*return*/, {
                    content: [
                        {
                            type: "text",
                            text: "Error getting repository stats: ".concat(error instanceof Error ? error.message : String(error)),
                        },
                    ],
                }];
        }
        return [2 /*return*/];
    });
}); });
// Get dependency graph
server.tool("get-dependency-graph", "Get the dependency graph for a specific file or the entire repository.", {
    filePath: zod_1.z.string().optional().describe("Specific file path (if not provided, returns global dependency overview)"),
    depth: zod_1.z.number().optional().describe("Maximum depth for dependency traversal (default: 3)"),
    includeExternal: zod_1.z.boolean().optional().describe("Include external/node_modules dependencies (default: false)"),
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var dependencyGraph, result, tree, error_5;
    var filePath = _b.filePath, depth = _b.depth, includeExternal = _b.includeExternal;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                if (!indexer) {
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: "Repository not indexed. Please run 'index-repository' first.",
                                },
                            ],
                        }];
                }
                return [4 /*yield*/, indexer.getDependencyGraph({
                        filePath: filePath,
                        depth: depth || 3,
                        includeExternal: includeExternal || false,
                    })];
            case 1:
                dependencyGraph = _c.sent();
                result = filePath
                    ? "\uD83D\uDD17 Dependency graph for ".concat(filePath, "\n")
                    : "\uD83D\uDD17 Repository dependency overview\n";
                result += "".concat('='.repeat(40), "\n\n");
                if (dependencyGraph.nodes.length === 0) {
                    result += "No dependencies found.";
                }
                else {
                    result += "\uD83D\uDCCA Summary:\n";
                    result += "  - Total files: ".concat(dependencyGraph.nodes.length, "\n");
                    result += "  - Total dependencies: ".concat(dependencyGraph.edges.length, "\n\n");
                    result += "\uD83C\uDF10 Dependency tree:\n";
                    tree = createDependencyTree(dependencyGraph);
                    result += tree;
                }
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: result,
                            },
                        ],
                    }];
            case 2:
                error_5 = _c.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "Error getting dependency graph: ".concat(error_5 instanceof Error ? error_5.message : String(error_5)),
                            },
                        ],
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); });
function createDependencyTree(graph) {
    var visited = new Set();
    var result = [];
    function traverse(node, depth, prefix) {
        if (depth === void 0) { depth = 0; }
        if (prefix === void 0) { prefix = ''; }
        if (visited.has(node) || depth > 5)
            return;
        visited.add(node);
        result.push("".concat(prefix).concat(depth > 0 ? '├── ' : '').concat(node));
        var dependencies = graph.edges
            .filter(function (edge) { return edge.from === node; })
            .map(function (edge) { return edge.to; })
            .slice(0, 10); // Limit to avoid overwhelming output
        dependencies.forEach(function (dep, index) {
            var isLast = index === dependencies.length - 1;
            var newPrefix = prefix + (depth > 0 ? (isLast ? '    ' : '│   ') : '');
            traverse(dep, depth + 1, newPrefix);
        });
    }
    // Start with root nodes (files that aren't dependencies of others)
    var rootNodes = graph.nodes.filter(function (node) {
        return !graph.edges.some(function (edge) { return edge.to === node; });
    }).slice(0, 10);
    if (rootNodes.length === 0) {
        // If no clear root nodes, start with first few nodes
        graph.nodes.slice(0, 5).forEach(function (node) { return traverse(node); });
    }
    else {
        rootNodes.forEach(function (node) { return traverse(node); });
    }
    return result.join('\n');
}
// Main server startup
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var transport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transport = new stdio_js_1.StdioServerTransport();
                    return [4 /*yield*/, server.connect(transport)];
                case 1:
                    _a.sent();
                    console.error("Repository Indexer MCP Server running on stdio");
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
