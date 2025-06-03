# Repository Indexer MCP Server

A powerful Model Context Protocol (MCP) server designed to index entire repositories and provide intelligent search capabilities for AI assistants like GitHub Copilot and Cursor. This server enables AI to work effectively with extremely large codebases by providing fast, semantic search and comprehensive codebase analysis.

## Features

### 🔍 **Intelligent Repository Indexing**
- Scans and indexes entire codebases with smart file filtering
- Supports 25+ programming languages
- Respects `.gitignore` and custom exclude patterns
- Configurable file size limits and inclusion patterns
- Real-time file watching for dynamic updates

### 🔎 **Advanced Search Capabilities**
- **Code Search**: Find functions, classes, variables across all files
- **Pattern Matching**: Support for regex and glob patterns
- **Semantic Search**: Relevance scoring based on context and importance
- **File Discovery**: Locate files by name or pattern
- **Symbol Search**: Find specific functions, classes, or interfaces

### 📊 **Dependency Analysis**
- Extract import/require statements from code
- Build dependency graphs for individual files or entire repository
- Visualize relationships between modules
- Support for internal and external dependencies

### 📈 **Repository Insights**
- Comprehensive statistics (file counts, lines of code, languages)
- Largest files identification
- Language distribution analysis
- File type breakdown

### 🛠 **AI Assistant Integration**
- Optimized for GitHub Copilot and Cursor
- Standard MCP protocol compliance
- Efficient context delivery for large codebases
- Structured output for AI consumption

## Supported Languages

- **Web**: JavaScript, TypeScript, HTML, CSS, SCSS, SASS, Less, Vue, Svelte, Astro
- **Backend**: Python, Java, C/C++, C#, Go, Rust, PHP, Ruby, Scala, Kotlin
- **Mobile**: Swift, Dart, Kotlin
- **Functional**: Haskell, OCaml, Clojure, Elm
- **Scripting**: Shell, PowerShell, Lua, R
- **Data**: SQL, JSON, YAML, XML
- **Documentation**: Markdown, Text

## Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git (for repository access)

### Build the Server

```bash
# Clone and setup
git clone <repository-url>
cd repo-indexer-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

### Configure for Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "repo-indexer": {
      "command": "node",
      "args": ["/absolute/path/to/repo-indexer-mcp-server/build/index.js"]
    }
  }
}
```

### Configure for VS Code (with MCP extension)

The `.vscode/mcp.json` file is already configured. Update the path as needed.

## Usage

### Quick Start

1. **Build the server:**
   ```bash
   npm run build
   ```

2. **Test the server:**
   ```bash
   node -e "require('./build/indexer.js'); console.log('✅ Server ready!')"
   ```

3. **Run with Claude Desktop:**
   - Copy the contents of `claude-desktop-config.json` to your Claude Desktop configuration
   - Update the path to match your installation location
   - Restart Claude Desktop

4. **Use the tools:**
   - `index-repository` - Index a codebase for AI assistance
   - `search-code` - Search for code patterns across files
   - `get-file-info` - Get detailed file information
   - `find-files` - Find files by name or pattern
   - `get-repo-stats` - Get repository statistics
   - `get-dependency-graph` - Analyze file dependencies

### Example Usage with Claude Desktop

After setting up the MCP server with Claude Desktop, you can use it like this:

```
Please index the repository at /path/to/my/project and then search for all React components
```

Claude will use the MCP server to:
1. Index your entire codebase
2. Search for React component patterns
3. Provide detailed analysis of your project structure

### 1. Index a Repository

```
index-repository
- repositoryPath: "/path/to/your/repo"
- includePatterns: ["**/*.{js,ts,py,java}"] (optional)
- excludePatterns: ["**/test/**"] (optional) 
- maxFileSize: 1000 (optional, in KB)
- followSymlinks: false (optional)
```

### 2. Search Code

```
search-code
- query: "function authenticate"
- fileTypes: ["js", "ts"] (optional)
- maxResults: 20 (optional)
- caseSensitive: false (optional)
- useRegex: false (optional)
- includeContext: true (optional)
```

### 3. Find Files

```
find-files
- pattern: "*.component.ts"
- maxResults: 50 (optional)
```

### 4. Get File Information

```
get-file-info
- filePath: "src/components/Button.tsx"
- includeContent: true (optional)
- includeDependencies: true (optional)
```

### 5. Repository Statistics

```
get-repo-stats
```

### 6. Dependency Analysis

```
get-dependency-graph
- filePath: "src/main.ts" (optional, for specific file)
- depth: 3 (optional)
- includeExternal: false (optional)
```

## Configuration Options

### Include Patterns (Default)
```javascript
[
  "**/*.{js,jsx,ts,tsx,py,java,cpp,c,h,hpp,cs,php,rb,go,rs,swift,kt,scala,clj,ml,hs,elm,dart,lua,r,sql,sh,bash,zsh,fish,ps1,bat,cmd,md,txt,json,yaml,yml,xml,html,css,scss,sass,less,vue,svelte,astro}"
]
```

### Exclude Patterns (Default)
```javascript
[
  "**/node_modules/**",
  "**/.git/**", 
  "**/build/**",
  "**/dist/**",
  "**/.next/**",
  "**/coverage/**",
  "**/target/**",
  "**/*.min.js",
  "**/*.min.css"
]
```

## Performance Considerations

### Large Repositories
- Default max file size: 1MB (configurable)
- Intelligent filtering reduces index size
- Memory usage scales with repository size
- Recommended for repositories up to 100K files

### Optimization Tips
- Use specific include patterns for faster indexing
- Exclude build directories and generated files
- Set appropriate file size limits
- Enable gitignore filtering

## Architecture

### Core Components

1. **RepositoryIndexer** (`src/indexer.ts`)
   - File discovery and filtering
   - Content analysis and metadata extraction
   - Dependency parsing for multiple languages
   - Index management and statistics

2. **FileSearcher** (`src/searcher.ts`)
   - Advanced search algorithms
   - Relevance scoring
   - Pattern matching (glob, regex)
   - Result ranking and filtering

3. **MCP Server** (`src/index.ts`)
   - Tool definitions and handlers
   - Protocol compliance
   - Error handling and validation
   - Integration with indexer and searcher

### Data Structures

```typescript
interface FileMetadata {
  path: string;           // Absolute file path
  relativePath: string;   // Relative to repo root
  size: number;          // File size in bytes
  lastModified: Date;    // Last modification time
  language: string;      // Detected language
  lines: number;         // Line count
  content: string;       // File content
  dependencies: string[]; // Extracted imports
  exports: string[];     // Extracted exports
  hash: string;          // Content hash for change detection
}
```

## API Reference

### Tool Schemas

All tools use Zod schemas for validation:

- **repositoryPath**: Absolute path to repository root
- **includePatterns**: Array of glob patterns for included files
- **excludePatterns**: Array of glob patterns for excluded files
- **query**: Search query string
- **fileTypes**: Array of file extensions to filter by
- **maxResults**: Maximum number of results to return

### Error Handling

The server provides detailed error messages for:
- Invalid repository paths
- Permission errors
- Out of memory conditions
- Invalid search patterns
- Missing dependencies

## Development

### Project Structure
```
src/
├── index.ts          # Main MCP server
├── indexer.ts        # Repository indexing engine  
└── searcher.ts       # Search functionality

.github/
└── copilot-instructions.md

.vscode/
├── mcp.json         # MCP configuration
└── tasks.json       # Build tasks
```

### Scripts
- `npm run build` - Compile TypeScript
- `npm run dev` - Watch mode development
- `npm start` - Run the built server

### Contributing
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## Troubleshooting

### Common Issues

**"Repository not indexed"**
- Run `index-repository` tool first
- Check repository path is correct
- Verify read permissions

**"No results found"**
- Check search query syntax
- Verify file types filter
- Try broader search terms

**Performance Issues**
- Reduce include patterns scope
- Increase exclude patterns
- Lower max file size limit
- Check available memory

**MCP Connection Issues**
- Verify build completed successfully
- Check absolute path in configuration
- Restart Claude Desktop/VS Code
- Check console for error messages

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

## Support

- Create issues for bugs or feature requests
- Check documentation for common questions  
- Review MCP protocol specification for integration details
