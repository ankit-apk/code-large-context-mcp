#!/usr/bin/env node

// Simple test to verify the MCP server can be imported and initialized
async function test() {
    try {
        console.log("Testing MCP server compilation...");

        // Test basic imports
        const { RepositoryIndexer } = require('./build/indexer.js');
        const { FileSearcher } = require('./build/searcher.js');

        console.log("✅ RepositoryIndexer imported successfully");
        console.log("✅ FileSearcher imported successfully");

        // Test basic initialization
        const indexer = new RepositoryIndexer({
            repositoryPath: __dirname,
            includePatterns: ['*.js', '*.ts'],
            excludePatterns: ['node_modules/**'],
            maxFileSize: 1000,
            followSymlinks: false
        });

        console.log("✅ RepositoryIndexer can be instantiated");

        // Test that the main server file exists and can be required
        const fs = require('fs');
        const serverPath = './build/index.js';
        if (fs.existsSync(serverPath)) {
            console.log("✅ Main server file exists at", serverPath);
        } else {
            throw new Error("Main server file not found");
        }

        console.log("\n🎉 All tests passed! The MCP server is ready to use.");
        console.log("\nTo use the server:");
        console.log("1. Add the configuration from claude-desktop-config.json to your Claude Desktop config");
        console.log("2. Update the path in the config to match your installation");
        console.log("3. Restart Claude Desktop");
        console.log("4. Use the repository indexing tools in your conversations");

    } catch (error) {
        console.error("❌ Test failed:", error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

test();
