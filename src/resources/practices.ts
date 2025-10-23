/**
 * Resource handlers for best practice documentation
 */

import { VALID_TOPICS, ValidTopic } from "../types";

/**
 * Generates a resource URI for a given topic
 */
export function getResourceUri(topic: ValidTopic): string {
  return `practice://${topic}`;
}

/**
 * Validates if a URI is a valid practice resource URI
 */
export function isValidResourceUri(uri: string): boolean {
  const match = uri.match(/^practice:\/\/(.+)$/);
  if (!match) return false;
  return VALID_TOPICS.includes(match[1] as any);
}

/**
 * Extracts the topic from a practice resource URI
 */
export function extractTopicFromUri(uri: string): ValidTopic | null {
  const match = uri.match(/^practice:\/\/(.+)$/);
  if (!match || !VALID_TOPICS.includes(match[1] as any)) {
    return null;
  }
  return match[1] as ValidTopic;
}

/**
 * Gets a human-readable name for a topic
 */
function getTopicName(topic: ValidTopic): string {
  const names: Record<ValidTopic, string> = {
    react: "React",
    nextjs: "Next.js",
    typescript: "TypeScript",
    zustand: "Zustand",
    "tanstack-query": "TanStack Query",
    ui: "UI/UX",
  };
  return names[topic];
}

/**
 * Gets a description for a topic
 */
function getTopicDescription(topic: ValidTopic): string {
  const descriptions: Record<ValidTopic, string> = {
    react: "Best practices for React development",
    nextjs: "Best practices for Next.js development",
    typescript: "Best practices for TypeScript development",
    zustand: "Best practices for Zustand state management",
    "tanstack-query": "Best practices for TanStack Query data fetching",
    ui: "Best practices for UI/UX design and implementation",
  };
  return descriptions[topic];
}

/**
 * Generates resource list for all available practices
 */
export function getResourceList() {
  return VALID_TOPICS.map((topic) => ({
    uri: getResourceUri(topic),
    name: `${getTopicName(topic)} Best Practices`,
    description: getTopicDescription(topic),
    mimeType: "text/markdown",
  }));
}
