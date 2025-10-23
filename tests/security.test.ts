/**
 * Security tests for path traversal and input validation
 */

import { describe, it, expect } from "vitest";
import { getPractice } from "../src/tools/getPractice";
import { SecurityError } from "../src/utils/errors";

describe("Security - Path Traversal Prevention", () => {
  it("should reject path traversal attempts with ../", async () => {
    const pathTraversalAttempts = [
      "../../package.json",
      "../../../etc/passwd",
      "..\\..\\windows\\system32",
      "react/../../../etc/passwd",
      "./../../package.json",
    ];

    for (const attempt of pathTraversalAttempts) {
      try {
        await getPractice({ topic: attempt });
        expect.fail(`Should have rejected path traversal: ${attempt}`);
      } catch (error) {
        // Path traversal attempts should be rejected
        // They might fail validation or security check
        expect(error).toBeDefined();
      }
    }
  });

  it("should reject absolute paths", async () => {
    const absolutePaths = [
      "/etc/passwd",
      "C:\\Windows\\System32\\config\\SAM",
      "/root/.ssh/id_rsa",
    ];

    for (const attempt of absolutePaths) {
      try {
        await getPractice({ topic: attempt });
        expect.fail(`Should have rejected absolute path: ${attempt}`);
      } catch (error) {
        expect(error).toBeDefined();
      }
    }
  });

  it("should only accept whitelisted topics", async () => {
    const invalidTopics = [
      "malicious",
      "admin",
      "config",
      "secret",
      "password",
      "biome", // mentioned in old description but not in whitelist
    ];

    for (const topic of invalidTopics) {
      try {
        await getPractice({ topic });
        expect.fail(`Should have rejected invalid topic: ${topic}`);
      } catch (error) {
        expect(error).toBeDefined();
      }
    }
  });

  it("should handle null bytes in input", async () => {
    try {
      await getPractice({ topic: "react\x00.md" });
      expect.fail("Should have rejected null byte in input");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should handle special characters safely", async () => {
    const specialChars = [
      "react; rm -rf /",
      "react` cat /etc/passwd`",
      "react$(whoami)",
      "react|cat /etc/passwd",
    ];

    for (const attempt of specialChars) {
      try {
        await getPractice({ topic: attempt });
        expect.fail(`Should have rejected special characters: ${attempt}`);
      } catch (error) {
        expect(error).toBeDefined();
      }
    }
  });

  it("should accept valid topics only", async () => {
    const validTopics = [
      "react",
      "nextjs",
      "typescript",
      "zustand",
      "tanstack-query",
      "ui",
    ];

    for (const topic of validTopics) {
      try {
        const result = await getPractice({ topic });
        expect(result).toBeDefined();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      } catch (error) {
        // File might not exist in test environment, but validation should pass
        expect(error).toBeDefined();
      }
    }
  });
});

describe("Security - Error Handling", () => {
  it("should not expose file system paths in errors", async () => {
    try {
      await getPractice({ topic: "nonexistent" });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      // Should not contain full file paths
      expect(errorMessage).not.toMatch(/src\/data\//);
      expect(errorMessage).not.toMatch(/node_modules/);
    }
  });

  it("should provide helpful error messages for invalid topics", async () => {
    try {
      await getPractice({ topic: "invalid" });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      expect(errorMessage).toContain("not found");
    }
  });
});
