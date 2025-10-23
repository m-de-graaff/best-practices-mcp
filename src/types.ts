/**
 * Type definitions and constants for the MCP server
 */

export const PACKAGE_NAME = "best-practices-mcp";
export const PACKAGE_VERSION = "1.0.0";

export const VALID_TOPICS = [
  "react",
  "nextjs",
  "typescript",
  "zustand",
  "tanstack-query",
  "ui",
] as const;

export type ValidTopic = (typeof VALID_TOPICS)[number];

/**
 * Mapping of topic names to their corresponding markdown files
 */
export const TOPIC_TO_FILE: Record<ValidTopic, string> = {
  react: "react-best-practices.md",
  nextjs: "nextjs-best-practices.md",
  typescript: "typescript-best-practices.md",
  zustand: "zustand-best-practices.md",
  "tanstack-query": "tanstack-query-best-practices.md",
  ui: "ui-best-practices.md",
};

export interface PracticeContent {
  topic: ValidTopic;
  content: string;
}
