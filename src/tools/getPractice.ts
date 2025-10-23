/**
 * Tool implementation for retrieving best practice documentation
 * Includes security measures to prevent path traversal attacks
 */

import path from "path";
import { promises as fs } from "fs";
import { GetPracticeInput } from "../validation";
import { TOPIC_TO_FILE } from "../types";
import { SecurityError, NotFoundError, FileReadError } from "../utils/errors";
import { logger } from "../utils/logger";

/**
 * Validates that a resolved path is within the base directory
 * Prevents path traversal attacks
 */
function validatePath(basePath: string, targetPath: string): boolean {
  const normalized = path.normalize(targetPath);
  const base = path.normalize(basePath);

  // Ensure target is within base directory
  return normalized.startsWith(base + path.sep) || normalized === base;
}

/**
 * Retrieves best practice documentation for a given topic
 * @param args - Input arguments containing the topic
 * @returns The content of the best practice file
 * @throws SecurityError if path traversal is detected
 * @throws NotFoundError if the file doesn't exist
 * @throws FileReadError for other file system errors
 */
export async function getPractice(args: GetPracticeInput): Promise<string> {
  const basePath = path.resolve("src/data");
  const fileName = TOPIC_TO_FILE[args.topic as keyof typeof TOPIC_TO_FILE];

  if (!fileName) {
    logger.warn("Unknown topic requested", { topic: args.topic });
    throw new NotFoundError(`Best practice for topic: ${args.topic}`);
  }

  const filePath = path.resolve(basePath, fileName);

  // CRITICAL SECURITY CHECK: Verify path is within basePath
  if (!validatePath(basePath, filePath)) {
    logger.error("Path traversal attempt detected", {
      topic: args.topic,
      filePath,
    });
    throw new SecurityError("Invalid topic path");
  }

  try {
    logger.debug("Reading practice file", { topic: args.topic, fileName });
    const content = await fs.readFile(filePath, "utf-8");
    logger.info("Successfully read practice file", { topic: args.topic });
    return content;
  } catch (error) {
    if (error instanceof Error) {
      if ("code" in error && error.code === "ENOENT") {
        logger.warn("Practice file not found", { topic: args.topic, filePath });
        throw new NotFoundError(`Best practice file for topic: ${args.topic}`);
      }
    }
    logger.error("Failed to read practice file", error);
    throw new FileReadError(
      `Failed to read best practice file: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
