/**
 * Entry point for the Best Practices MCP Server
 * Initializes the server and connects it to stdio transport
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server";
import { logger } from "./utils/logger";

/**
 * Main function to start the server
 */
async function main(): Promise<void> {
  try {
    const server = createServer();
    const transport = new StdioServerTransport();

    await server.connect(transport);
    logger.info("✅ Best Practices MCP server running on stdio");
  } catch (err) {
    logger.error("Fatal error starting server", err);
    process.exit(1);
  }
}

main();
