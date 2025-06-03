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
exports.FileSearcher = void 0;
var path = require("path");
var micromatch = require("micromatch");
var FileSearcher = /** @class */ (function () {
    function FileSearcher(index) {
        this.index = index;
    }
    FileSearcher.prototype.searchCode = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var results, query, fileTypes, _a, maxResults, _b, caseSensitive, _c, useRegex, _d, includeContext, searchPattern, escapedQuery, _i, _e, _f, filePath, metadata, fileExt, fileResults;
            return __generator(this, function (_g) {
                results = [];
                query = options.query, fileTypes = options.fileTypes, _a = options.maxResults, maxResults = _a === void 0 ? 20 : _a, _b = options.caseSensitive, caseSensitive = _b === void 0 ? false : _b, _c = options.useRegex, useRegex = _c === void 0 ? false : _c, _d = options.includeContext, includeContext = _d === void 0 ? true : _d;
                try {
                    if (useRegex) {
                        searchPattern = new RegExp(query, caseSensitive ? 'g' : 'gi');
                    }
                    else {
                        escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        searchPattern = new RegExp(escapedQuery, caseSensitive ? 'g' : 'gi');
                    }
                }
                catch (error) {
                    throw new Error("Invalid search pattern: ".concat(error));
                }
                // Search through indexed files
                for (_i = 0, _e = Array.from(this.index.entries()); _i < _e.length; _i++) {
                    _f = _e[_i], filePath = _f[0], metadata = _f[1];
                    // Filter by file types if specified
                    if (fileTypes && fileTypes.length > 0) {
                        fileExt = path.extname(filePath).slice(1).toLowerCase();
                        if (!fileTypes.includes(fileExt)) {
                            continue;
                        }
                    }
                    fileResults = this.searchInFile(metadata, searchPattern, includeContext);
                    results.push.apply(results, fileResults);
                    // Stop if we have enough results
                    if (results.length >= maxResults * 2) {
                        break;
                    }
                }
                // Sort by relevance score and limit results
                results.sort(function (a, b) { return b.score - a.score; });
                return [2 /*return*/, results.slice(0, maxResults)];
            });
        });
    };
    FileSearcher.prototype.searchInFile = function (metadata, pattern, includeContext) {
        var results = [];
        var lines = metadata.content.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var matches = Array.from(line.matchAll(pattern));
            if (matches.length > 0) {
                var context = '';
                if (includeContext) {
                    var contextLines = this.getContextLines(lines, i, 2);
                    context = contextLines.join('\n');
                }
                // Calculate relevance score
                var score = this.calculateRelevanceScore(line, matches, metadata);
                results.push({
                    file: metadata.relativePath,
                    lineNumber: i + 1,
                    matchedLine: line.trim(),
                    context: includeContext ? context : undefined,
                    score: score,
                });
            }
        }
        return results;
    };
    FileSearcher.prototype.getContextLines = function (lines, targetLine, contextSize) {
        var start = Math.max(0, targetLine - contextSize);
        var end = Math.min(lines.length, targetLine + contextSize + 1);
        var contextLines = [];
        for (var i = start; i < end; i++) {
            var prefix = i === targetLine ? '→ ' : '  ';
            var lineNumber = (i + 1).toString().padStart(3, ' ');
            contextLines.push("".concat(lineNumber).concat(prefix).concat(lines[i]));
        }
        return contextLines;
    };
    FileSearcher.prototype.calculateRelevanceScore = function (line, matches, metadata) {
        var score = 0;
        // Base score for having matches
        score += matches.length * 10;
        // Boost score for exact matches
        score += matches.filter(function (match) { return match[0].length > 3; }).length * 5;
        // Boost score for matches in important file types
        var importantExtensions = ['.ts', '.js', '.tsx', '.jsx', '.py', '.java', '.cpp', '.go'];
        if (importantExtensions.some(function (ext) { return metadata.path.endsWith(ext); })) {
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
        var pathDepth = metadata.relativePath.split(path.sep).length;
        score += Math.max(0, 10 - pathDepth);
        return Math.max(0, score);
    };
    FileSearcher.prototype.findFiles = function (pattern_1) {
        return __awaiter(this, arguments, void 0, function (pattern, maxResults) {
            var files, isGlobPattern, _i, _a, filePath, matches, fileName;
            if (maxResults === void 0) { maxResults = 50; }
            return __generator(this, function (_b) {
                files = [];
                isGlobPattern = pattern.includes('*') || pattern.includes('?') || pattern.includes('[');
                for (_i = 0, _a = Array.from(this.index.keys()); _i < _a.length; _i++) {
                    filePath = _a[_i];
                    matches = false;
                    if (isGlobPattern) {
                        // Use micromatch for glob pattern matching
                        matches = micromatch.isMatch(filePath, pattern, { nocase: true });
                    }
                    else {
                        fileName = path.basename(filePath);
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
                files.sort(function (a, b) {
                    var depthDiff = a.split(path.sep).length - b.split(path.sep).length;
                    return depthDiff !== 0 ? depthDiff : a.localeCompare(b);
                });
                return [2 /*return*/, files];
            });
        });
    };
    FileSearcher.prototype.findSymbols = function (symbolName, symbolType) {
        return __awaiter(this, void 0, void 0, function () {
            var results, patterns, searchPatterns, _i, _a, _b, filePath, metadata, _c, searchPatterns_1, pattern, fileResults, uniqueResults;
            return __generator(this, function (_d) {
                results = [];
                patterns = {
                    function: new RegExp("(?:function|def|fn)\\s+".concat(symbolName, "\\b"), 'gi'),
                    class: new RegExp("(?:class|interface)\\s+".concat(symbolName, "\\b"), 'gi'),
                    variable: new RegExp("(?:const|let|var|val)\\s+".concat(symbolName, "\\b"), 'gi'),
                    interface: new RegExp("interface\\s+".concat(symbolName, "\\b"), 'gi'),
                };
                searchPatterns = symbolType
                    ? [patterns[symbolType]].filter(Boolean)
                    : Object.values(patterns);
                for (_i = 0, _a = Array.from(this.index.entries()); _i < _a.length; _i++) {
                    _b = _a[_i], filePath = _b[0], metadata = _b[1];
                    for (_c = 0, searchPatterns_1 = searchPatterns; _c < searchPatterns_1.length; _c++) {
                        pattern = searchPatterns_1[_c];
                        fileResults = this.searchInFile(metadata, pattern, true);
                        results.push.apply(results, fileResults);
                    }
                }
                uniqueResults = results.filter(function (result, index, array) {
                    return array.findIndex(function (r) { return r.file === result.file && r.lineNumber === result.lineNumber; }) === index;
                });
                uniqueResults.sort(function (a, b) { return b.score - a.score; });
                return [2 /*return*/, uniqueResults.slice(0, 50)];
            });
        });
    };
    FileSearcher.prototype.findSimilarFiles = function (filePath, similarity) {
        return __awaiter(this, void 0, void 0, function () {
            var targetFile, results, _i, _a, _b, currentPath, metadata, score;
            return __generator(this, function (_c) {
                targetFile = this.index.get(filePath);
                if (!targetFile) {
                    return [2 /*return*/, []];
                }
                results = [];
                for (_i = 0, _a = Array.from(this.index.entries()); _i < _a.length; _i++) {
                    _b = _a[_i], currentPath = _b[0], metadata = _b[1];
                    if (currentPath === filePath)
                        continue;
                    score = 0;
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
                        results.push({ file: currentPath, score: score });
                    }
                }
                results.sort(function (a, b) { return b.score - a.score; });
                return [2 /*return*/, results.slice(0, 20)];
            });
        });
    };
    FileSearcher.prototype.calculateStructuralSimilarity = function (file1, file2) {
        // Compare file structure based on lines, language, and size
        var score = 0;
        // Same language
        if (file1.language === file2.language) {
            score += 0.3;
        }
        // Similar file size
        var sizeDiff = Math.abs(file1.size - file2.size) / Math.max(file1.size, file2.size);
        score += (1 - sizeDiff) * 0.2;
        // Similar line count
        var lineDiff = Math.abs(file1.lines - file2.lines) / Math.max(file1.lines, file2.lines);
        score += (1 - lineDiff) * 0.2;
        // Similar export count
        var exportDiff = Math.abs(file1.exports.length - file2.exports.length) /
            Math.max(file1.exports.length || 1, file2.exports.length || 1);
        score += (1 - exportDiff) * 0.3;
        return Math.min(1, score);
    };
    FileSearcher.prototype.calculateContentSimilarity = function (file1, file2) {
        // Simple content similarity based on common words
        var words1 = new Set(file1.content.toLowerCase().split(/\W+/).filter(function (w) { return w.length > 3; }));
        var words2 = new Set(file2.content.toLowerCase().split(/\W+/).filter(function (w) { return w.length > 3; }));
        var intersection = new Set(Array.from(words1).filter(function (w) { return words2.has(w); }));
        var union = new Set(__spreadArray(__spreadArray([], Array.from(words1), true), Array.from(words2), true));
        return intersection.size / union.size;
    };
    FileSearcher.prototype.calculateImportSimilarity = function (file1, file2) {
        if (file1.dependencies.length === 0 && file2.dependencies.length === 0) {
            return 0;
        }
        var deps1 = new Set(file1.dependencies);
        var deps2 = new Set(file2.dependencies);
        var intersection = new Set(Array.from(deps1).filter(function (d) { return deps2.has(d); }));
        var union = new Set(__spreadArray(__spreadArray([], Array.from(deps1), true), Array.from(deps2), true));
        return intersection.size / union.size;
    };
    FileSearcher.prototype.getSearchStatistics = function () {
        var totalLines = 0;
        var totalSize = 0;
        var languages = {};
        for (var _i = 0, _a = Array.from(this.index.values()); _i < _a.length; _i++) {
            var metadata = _a[_i];
            totalLines += metadata.lines;
            totalSize += metadata.size;
            languages[metadata.language] = (languages[metadata.language] || 0) + 1;
        }
        return {
            totalFiles: this.index.size,
            totalLines: totalLines,
            averageFileSize: this.index.size > 0 ? totalSize / this.index.size : 0,
            languageDistribution: languages,
        };
    };
    return FileSearcher;
}());
exports.FileSearcher = FileSearcher;
