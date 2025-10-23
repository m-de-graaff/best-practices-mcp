/**
 * Tests for input validation schemas
 */

import { describe, it, expect } from "vitest";
import { getPracticeSchema } from "../src/validation";
import { z } from "zod";

describe("getPracticeSchema", () => {
  it("should accept valid topics", () => {
    const validTopics = [
      "react",
      "nextjs",
      "typescript",
      "zustand",
      "tanstack-query",
      "ui",
    ];

    for (const topic of validTopics) {
      const result = getPracticeSchema.safeParse({ topic });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.topic).toBe(topic);
      }
    }
  });

  it("should accept topics in uppercase and convert to lowercase", () => {
    const result = getPracticeSchema.safeParse({ topic: "REACT" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.topic).toBe("react");
    }
  });

  it("should accept topics with mixed case", () => {
    const result = getPracticeSchema.safeParse({ topic: "ReAcT" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.topic).toBe("react");
    }
  });

  it("should reject invalid topics", () => {
    const invalidTopics = ["invalid", "python", "java", "biome", "unknown"];

    for (const topic of invalidTopics) {
      const result = getPracticeSchema.safeParse({ topic });
      expect(result.success).toBe(false);
    }
  });

  it("should reject empty topic", () => {
    const result = getPracticeSchema.safeParse({ topic: "" });
    expect(result.success).toBe(false);
  });

  it("should reject topic that is too long", () => {
    const longTopic = "a".repeat(51);
    const result = getPracticeSchema.safeParse({ topic: longTopic });
    expect(result.success).toBe(false);
  });

  it("should reject missing topic", () => {
    const result = getPracticeSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject non-string topic", () => {
    const result = getPracticeSchema.safeParse({ topic: 123 });
    expect(result.success).toBe(false);
  });

  it("should provide helpful error messages", () => {
    const result = getPracticeSchema.safeParse({ topic: "invalid" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      expect(errorMessage).toContain("Invalid topic");
      expect(errorMessage).toContain("react");
    }
  });
});
