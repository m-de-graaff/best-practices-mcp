/**
 * MCP Server setup and request handlers
 */

import { Server } from "@modelcontextprotocol/sdk/server";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { PACKAGE_NAME, PACKAGE_VERSION, VALID_TOPICS } from "./types";
import { getPracticeSchema } from "./validation";
import { getPractice } from "./tools/getPractice";
import {
  getResourceList,
  isValidResourceUri,
  extractTopicFromUri,
} from "./resources/practices";
import { NotFoundError, SecurityError, FileReadError } from "./utils/errors";
import { logger } from "./utils/logger";

/**
 * Creates and configures the MCP server
 */
export function createServer(): Server {
  const server = new Server(
    { name: PACKAGE_NAME, version: PACKAGE_VERSION },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  /**
   * Handler for ListToolsRequestSchema
   * Returns available tools
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.debug("ListTools request received");
    return {
      tools: [
        {
          name: "get_best_practice",
          description: "Retrieve best practice documentation for a given topic",
          inputSchema: {
            type: "object",
            properties: {
              topic: {
                type: "string",
                enum: VALID_TOPICS,
                description: `Topic to fetch best practices for (${VALID_TOPICS.join(
                  ", "
                )})`,
              },
            },
            required: ["topic"],
          },
        },
      ],
    };
  });

  /**
   * Handler for CallToolRequestSchema
   * Executes tools
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    logger.debug("CallTool request received", { tool: request.params.name });

    if (request.params.name !== "get_best_practice") {
      logger.warn("Unknown tool requested", { tool: request.params.name });
      return {
        isError: true,
        content: [
          { type: "text", text: `Unknown tool: ${request.params.name}` },
        ],
      };
    }

    try {
      const args = getPracticeSchema.parse(request.params.arguments);
      const content = await getPractice(args);

      return {
        content: [{ type: "text/markdown", text: content }],
      };
    } catch (error) {
      // Validation error
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues
          .map((issue) => issue.message)
          .join(", ");
        logger.warn("Validation error", { errors: errorMessages });
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Invalid input: ${errorMessages}`,
            },
          ],
        };
      }

      // File not found
      if (error instanceof NotFoundError) {
        logger.info("Resource not found", { message: error.message });
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `${error.message}. Available topics: ${VALID_TOPICS.join(
                ", "
              )}`,
            },
          ],
        };
      }

      // Security error
      if (error instanceof SecurityError) {
        logger.error("Security violation", error);
        return {
          isError: true,
          content: [{ type: "text", text: "Access denied" }],
        };
      }

      // File read error
      if (error instanceof FileReadError) {
        logger.error("File read error", error);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "An error occurred while retrieving the best practice",
            },
          ],
        };
      }

      // Unexpected error
      logger.error("Unexpected error in tool handler", error);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: "An unexpected error occurred",
          },
        ],
      };
    }
  });

  /**
   * Handler for ListResourcesRequestSchema
   * Returns available resources
   */
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    logger.debug("ListResources request received");
    return {
      resources: getResourceList(),
    };
  });

  /**
   * Handler for ReadResourceRequestSchema
   * Reads a specific resource
   */
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    logger.debug("ReadResource request received", { uri: request.params.uri });

    if (!isValidResourceUri(request.params.uri)) {
      logger.warn("Invalid resource URI", { uri: request.params.uri });
      throw new Error(`Invalid resource URI: ${request.params.uri}`);
    }

    try {
      const topic = extractTopicFromUri(request.params.uri);
      if (!topic) {
        throw new Error(
          `Could not extract topic from URI: ${request.params.uri}`
        );
      }

      const content = await getPractice({ topic });

      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: "text/markdown",
            text: content,
          },
        ],
      };
    } catch (error) {
      logger.error("Failed to read resource", error);
      throw new Error(
        `Failed to read resource: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  });

  return server;
}
