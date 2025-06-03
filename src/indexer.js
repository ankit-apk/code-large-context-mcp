"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryIndexer = void 0;
var fs = require("fs-extra");
var path = require("path");
var fast_glob_1 = require("fast-glob");
var ignore = require("ignore");
var chokidar = require("chokidar");
var RepositoryIndexer = /** @class */ (function () {
    function RepositoryIndexer(config) {
        this.index = new Map();
        this.gitignore = null;
        this.watcher = null;
        this.config = __assign(__assign({}, config), { repositoryPath: path.resolve(config.repositoryPath) });
    }
    RepositoryIndexer.prototype.indexRepository = function () {
        return __awaiter(this, void 0, void 0, function () {
            var files, filesIndexed, totalLines, languages, _i, files_1, file, metadata, error_1, indexSizeBytes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.error("Starting repository indexing: ".concat(this.config.repositoryPath));
                        // Load .gitignore if it exists
                        return [4 /*yield*/, this.loadGitignore()];
                    case 1:
                        // Load .gitignore if it exists
                        _a.sent();
                        // Clear existing index
                        this.index.clear();
                        return [4 /*yield*/, this.findFilesToIndex()];
                    case 2:
                        files = _a.sent();
                        console.error("Found ".concat(files.length, " files to index"));
                        filesIndexed = 0;
                        totalLines = 0;
                        languages = new Set();
                        _i = 0, files_1 = files;
                        _a.label = 3;
                    case 3:
                        if (!(_i < files_1.length)) return [3 /*break*/, 8];
                        file = files_1[_i];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.indexFile(file)];
                    case 5:
                        metadata = _a.sent();
                        if (metadata) {
                            this.index.set(metadata.relativePath, metadata);
                            filesIndexed++;
                            totalLines += metadata.lines;
                            languages.add(metadata.language);
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error("Error indexing file ".concat(file, ":"), error_1);
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8:
                        indexSizeBytes = this.calculateIndexSize();
                        console.error("Indexing complete: ".concat(filesIndexed, " files, ").concat(totalLines, " lines"));
                        return [2 /*return*/, {
                                filesIndexed: filesIndexed,
                                totalLines: totalLines,
                                languages: Array.from(languages),
                                indexSizeBytes: indexSizeBytes,
                            }];
                }
            });
        });
    };
    RepositoryIndexer.prototype.loadGitignore = function () {
        return __awaiter(this, void 0, void 0, function () {
            var gitignorePath, gitignoreContent, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        gitignorePath = path.join(this.config.repositoryPath, '.gitignore');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, fs.pathExists(gitignorePath)];
                    case 2:
                        if (!_a.sent()) return [3 /*break*/, 4];
                        return [4 /*yield*/, fs.readFile(gitignorePath, 'utf-8')];
                    case 3:
                        gitignoreContent = _a.sent();
                        this.gitignore = ignore().add(gitignoreContent);
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_2 = _a.sent();
                        console.error('Error loading .gitignore:', error_2);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    RepositoryIndexer.prototype.findFilesToIndex = function () {
        return __awaiter(this, void 0, void 0, function () {
            var patterns, excludePatterns, files;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        patterns = this.config.includePatterns.map(function (pattern) {
                            return path.join(_this.config.repositoryPath, pattern);
                        });
                        excludePatterns = __spreadArray([
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
                            '**/Thumbs.db'
                        ], this.config.excludePatterns, true);
                        return [4 /*yield*/, (0, fast_glob_1.glob)(patterns, {
                                ignore: excludePatterns,
                                absolute: true,
                                followSymbolicLinks: this.config.followSymlinks,
                                onlyFiles: true,
                            })];
                    case 1:
                        files = _a.sent();
                        // Filter through gitignore if available
                        if (this.gitignore) {
                            return [2 /*return*/, files.filter(function (file) {
                                    var relativePath = path.relative(_this.config.repositoryPath, file);
                                    return !_this.gitignore.ignores(relativePath);
                                })];
                        }
                        return [2 /*return*/, files];
                }
            });
        });
    };
    RepositoryIndexer.prototype.indexFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var stats, relativePath, content, lines, language, dependencies, exports_1, hash, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fs.stat(filePath)];
                    case 1:
                        stats = _a.sent();
                        // Skip files that are too large
                        if (stats.size > this.config.maxFileSize * 1024) {
                            return [2 /*return*/, null];
                        }
                        relativePath = path.relative(this.config.repositoryPath, filePath);
                        return [4 /*yield*/, fs.readFile(filePath, 'utf-8')];
                    case 2:
                        content = _a.sent();
                        lines = content.split('\n').length;
                        language = this.detectLanguage(filePath, content);
                        dependencies = this.extractDependencies(content, language);
                        exports_1 = this.extractExports(content, language);
                        hash = this.createHash(content);
                        return [2 /*return*/, {
                                path: filePath,
                                relativePath: relativePath,
                                size: stats.size,
                                lastModified: stats.mtime,
                                language: language,
                                lines: lines,
                                content: content,
                                dependencies: dependencies,
                                exports: exports_1,
                                hash: hash,
                            }];
                    case 3:
                        error_3 = _a.sent();
                        console.error("Error reading file ".concat(filePath, ":"), error_3);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    RepositoryIndexer.prototype.detectLanguage = function (filePath, content) {
        var ext = path.extname(filePath).toLowerCase();
        var languageMap = {
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
    };
    RepositoryIndexer.prototype.extractDependencies = function (content, language) {
        var dependencies = new Set();
        // JavaScript/TypeScript imports
        if (language === 'javascript' || language === 'typescript') {
            var importRegex = /(?:import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]|require\s*\(\s*['"`]([^'"`]+)['"`]\s*\))/g;
            var match = void 0;
            while ((match = importRegex.exec(content)) !== null) {
                dependencies.add(match[1] || match[2]);
            }
        }
        // Python imports
        if (language === 'python') {
            var importRegex = /(?:from\s+(\S+)\s+import|import\s+(\S+))/g;
            var match = void 0;
            while ((match = importRegex.exec(content)) !== null) {
                dependencies.add(match[1] || match[2]);
            }
        }
        // Java imports
        if (language === 'java') {
            var importRegex = /import\s+(?:static\s+)?([^;]+);/g;
            var match = void 0;
            while ((match = importRegex.exec(content)) !== null) {
                dependencies.add(match[1]);
            }
        }
        // Go imports
        if (language === 'go') {
            var importRegex = /import\s+(?:\(\s*)?["']([^"']+)["']/g;
            var match = void 0;
            while ((match = importRegex.exec(content)) !== null) {
                dependencies.add(match[1]);
            }
        }
        return Array.from(dependencies);
    };
    RepositoryIndexer.prototype.extractExports = function (content, language) {
        var exports = new Set();
        // JavaScript/TypeScript exports
        if (language === 'javascript' || language === 'typescript') {
            var exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type|enum)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
            var match = void 0;
            while ((match = exportRegex.exec(content)) !== null) {
                exports.add(match[1]);
            }
            // Named exports
            var namedExportRegex = /export\s*\{\s*([^}]+)\s*\}/g;
            while ((match = namedExportRegex.exec(content)) !== null) {
                var names = match[1].split(',').map(function (name) { return name.trim().split(' as ')[0].trim(); });
                names.forEach(function (name) { return exports.add(name); });
            }
        }
        // Python exports (functions and classes at module level)
        if (language === 'python') {
            var exportRegex = /^(?:def|class)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gm;
            var match = void 0;
            while ((match = exportRegex.exec(content)) !== null) {
                if (!match[1].startsWith('_')) { // Exclude private functions/classes
                    exports.add(match[1]);
                }
            }
        }
        // Java public classes/methods
        if (language === 'java') {
            var exportRegex = /public\s+(?:class|interface|enum)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
            var match = void 0;
            while ((match = exportRegex.exec(content)) !== null) {
                exports.add(match[1]);
            }
        }
        return Array.from(exports);
    };
    RepositoryIndexer.prototype.createHash = function (content) {
        // Simple hash function for content change detection
        var hash = 0;
        for (var i = 0; i < content.length; i++) {
            var char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    };
    RepositoryIndexer.prototype.calculateIndexSize = function () {
        var size = 0;
        for (var _i = 0, _a = Array.from(this.index.values()); _i < _a.length; _i++) {
            var metadata = _a[_i];
            size += JSON.stringify(metadata).length;
        }
        return size;
    };
    RepositoryIndexer.prototype.getIndex = function () {
        return this.index;
    };
    RepositoryIndexer.prototype.getFileInfo = function (filePath_1) {
        return __awaiter(this, arguments, void 0, function (filePath, options) {
            var metadata, result;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                metadata = this.index.get(filePath);
                if (!metadata) {
                    return [2 /*return*/, null];
                }
                result = __assign({}, metadata);
                if (options.includeContent === false) {
                    result.content = '';
                }
                if (options.includeDependencies === false) {
                    result.dependencies = [];
                }
                return [2 /*return*/, result];
            });
        });
    };
    RepositoryIndexer.prototype.getRepositoryStats = function () {
        var fileTypes = {};
        var languages = {};
        var totalLines = 0;
        var totalSize = 0;
        var largestFiles = [];
        for (var _i = 0, _a = Array.from(this.index.values()); _i < _a.length; _i++) {
            var metadata = _a[_i];
            var ext = path.extname(metadata.path).toLowerCase() || 'no-extension';
            fileTypes[ext] = (fileTypes[ext] || 0) + 1;
            languages[metadata.language] = (languages[metadata.language] || 0) + 1;
            totalLines += metadata.lines;
            totalSize += metadata.size;
            largestFiles.push({ path: metadata.relativePath, size: metadata.size });
        }
        largestFiles.sort(function (a, b) { return b.size - a.size; });
        return {
            repositoryPath: this.config.repositoryPath,
            totalFiles: this.index.size,
            totalLines: totalLines,
            totalSize: totalSize,
            fileTypes: fileTypes,
            languages: languages,
            largestFiles: largestFiles.slice(0, 10),
        };
    };
    RepositoryIndexer.prototype.getDependencyGraph = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var nodes, edges, _i, _a, metadata, _b, _c, dep;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        nodes = new Set();
                        edges = [];
                        if (!options.filePath) return [3 /*break*/, 2];
                        // Build dependency graph for a specific file
                        return [4 /*yield*/, this.buildFileDepGraph(options.filePath, nodes, edges, options.depth || 3, 0, options.includeExternal || false)];
                    case 1:
                        // Build dependency graph for a specific file
                        _d.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        // Build global dependency overview
                        for (_i = 0, _a = Array.from(this.index.values()); _i < _a.length; _i++) {
                            metadata = _a[_i];
                            nodes.add(metadata.relativePath);
                            for (_b = 0, _c = metadata.dependencies; _b < _c.length; _b++) {
                                dep = _c[_b];
                                if (options.includeExternal || this.index.has(dep)) {
                                    edges.push({
                                        from: metadata.relativePath,
                                        to: dep,
                                        type: this.getDependencyType(dep),
                                    });
                                }
                            }
                        }
                        _d.label = 3;
                    case 3: return [2 /*return*/, {
                            nodes: Array.from(nodes),
                            edges: edges,
                        }];
                }
            });
        });
    };
    RepositoryIndexer.prototype.buildFileDepGraph = function (filePath, nodes, edges, maxDepth, currentDepth, includeExternal) {
        return __awaiter(this, void 0, void 0, function () {
            var metadata, _i, _a, dep;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (currentDepth >= maxDepth || nodes.has(filePath)) {
                            return [2 /*return*/];
                        }
                        metadata = this.index.get(filePath);
                        if (!metadata) {
                            return [2 /*return*/];
                        }
                        nodes.add(filePath);
                        _i = 0, _a = metadata.dependencies;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        dep = _a[_i];
                        if (!(includeExternal || this.index.has(dep))) return [3 /*break*/, 3];
                        edges.push({
                            from: filePath,
                            to: dep,
                            type: this.getDependencyType(dep),
                        });
                        if (!this.index.has(dep)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.buildFileDepGraph(dep, nodes, edges, maxDepth, currentDepth + 1, includeExternal)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    RepositoryIndexer.prototype.getDependencyType = function (dependency) {
        if (dependency.startsWith('.') || dependency.startsWith('/')) {
            return 'relative';
        }
        if (dependency.includes('node_modules') || !this.index.has(dependency)) {
            return 'external';
        }
        return 'internal';
    };
    RepositoryIndexer.prototype.startWatching = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.watcher) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.watcher.close()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
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
                        this.watcher.on('add', function (filePath) { return callback('add', filePath); });
                        this.watcher.on('change', function (filePath) { return callback('change', filePath); });
                        this.watcher.on('unlink', function (filePath) { return callback('unlink', filePath); });
                        return [2 /*return*/];
                }
            });
        });
    };
    RepositoryIndexer.prototype.stopWatching = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.watcher) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.watcher.close()];
                    case 1:
                        _a.sent();
                        this.watcher = null;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    return RepositoryIndexer;
}());
exports.RepositoryIndexer = RepositoryIndexer;
