# GitHub Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is an MCP (Model Context Protocol) server project designed for repository indexing and search functionality for AI assistants like GitHub Copilot and Cursor.

## Project Overview

You can find more info and examples at https://modelcontextprotocol.io/llms-full.txt

This MCP server provides the following capabilities:

### Core Features
- **Repository Indexing**: Scan and index entire codebases with intelligent file filtering
- **Semantic Search**: Search for code patterns, functions, classes across all indexed files
- **Dependency Analysis**: Extract and visualize dependencies between files
- **File Discovery**: Find files by name or glob patterns
- **Repository Statistics**: Get comprehensive overview of codebase metrics

### Key Tools Available
1. `index-repository` - Index a repository for AI-assisted development
2. `search-code` - Search for code patterns across the indexed repository
3. `get-file-info` - Get detailed information about specific files
4. `find-files` - Find files by name or pattern
5. `get-repo-stats` - Get repository statistics and overview
6. `get-dependency-graph` - Analyze file dependencies

### Architecture
- **indexer.ts**: Core repository indexing engine with file metadata extraction
- **searcher.ts**: Advanced search functionality with relevance scoring
- **index.ts**: Main MCP server implementation with tool definitions

### Supported Languages
JavaScript, TypeScript, Python, Java, C/C++, C#, PHP, Ruby, Go, Rust, Swift, Kotlin, Scala, Clojure, OCaml, Haskell, Elm, Dart, Lua, R, SQL, Shell scripts, and more.

### Configuration Options
- Custom include/exclude patterns
- File size limits
- Symlink following
- Gitignore integration
- Real-time file watching

When working on this project:
- Focus on performance for large repositories
- Maintain comprehensive TypeScript types
- Follow MCP protocol specifications
- Implement robust error handling
- Consider memory usage for large codebases
