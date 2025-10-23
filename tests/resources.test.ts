/**
 * Tests for resource handlers
 */

import { describe, it, expect } from "vitest";
import {
  getResourceUri,
  isValidResourceUri,
  extractTopicFromUri,
  getResourceList,
} from "../src/resources/practices";
import { VALID_TOPICS } from "../src/types";

describe("Resource Utilities", () => {
  describe("getResourceUri", () => {
    it("should generate valid resource URIs", () => {
      for (const topic of VALID_TOPICS) {
        const uri = getResourceUri(topic);
        expect(uri).toBe(`practice://${topic}`);
      }
    });

    it("should generate URIs with correct format", () => {
      const uri = getResourceUri("react");
      expect(uri).toMatch(/^practice:\/\//);
      expect(uri).toContain("react");
    });
  });

  describe("isValidResourceUri", () => {
    it("should accept valid resource URIs", () => {
      for (const topic of VALID_TOPICS) {
        const uri = `practice://${topic}`;
        expect(isValidResourceUri(uri)).toBe(true);
      }
    });

    it("should reject invalid URIs", () => {
      const invalidUris = [
        "http://example.com",
        "file:///etc/passwd",
        "practice://invalid",
        "practice://biome",
        "practice://",
        "practice://react/extra",
        "resource://react",
        "react",
        "",
      ];

      for (const uri of invalidUris) {
        expect(isValidResourceUri(uri)).toBe(false);
      }
    });

    it("should be case-sensitive for protocol", () => {
      expect(isValidResourceUri("PRACTICE://react")).toBe(false);
      expect(isValidResourceUri("Practice://react")).toBe(false);
    });
  });

  describe("extractTopicFromUri", () => {
    it("should extract topic from valid URIs", () => {
      for (const topic of VALID_TOPICS) {
        const uri = `practice://${topic}`;
        const extracted = extractTopicFromUri(uri);
        expect(extracted).toBe(topic);
      }
    });

    it("should return null for invalid URIs", () => {
      const invalidUris = [
        "http://example.com",
        "practice://invalid",
        "practice://",
        "resource://react",
      ];

      for (const uri of invalidUris) {
        expect(extractTopicFromUri(uri)).toBeNull();
      }
    });

    it("should handle edge cases", () => {
      expect(extractTopicFromUri("")).toBeNull();
      expect(extractTopicFromUri("practice://")).toBeNull();
      expect(extractTopicFromUri("practice://react/extra")).toBeNull();
    });
  });

  describe("getResourceList", () => {
    it("should return list of all resources", () => {
      const resources = getResourceList();
      expect(resources).toHaveLength(VALID_TOPICS.length);
    });

    it("should include all valid topics", () => {
      const resources = getResourceList();
      const topics = resources.map((r) => {
        const match = r.uri.match(/^practice:\/\/(.+)$/);
        return match ? match[1] : null;
      });

      for (const topic of VALID_TOPICS) {
        expect(topics).toContain(topic);
      }
    });

    it("should have correct resource structure", () => {
      const resources = getResourceList();

      for (const resource of resources) {
        expect(resource).toHaveProperty("uri");
        expect(resource).toHaveProperty("name");
        expect(resource).toHaveProperty("description");
        expect(resource).toHaveProperty("mimeType");

        expect(typeof resource.uri).toBe("string");
        expect(typeof resource.name).toBe("string");
        expect(typeof resource.description).toBe("string");
        expect(resource.mimeType).toBe("text/markdown");

        expect(resource.uri).toMatch(/^practice:\/\//);
        expect(resource.name.length).toBeGreaterThan(0);
        expect(resource.description.length).toBeGreaterThan(0);
      }
    });

    it("should have unique URIs", () => {
      const resources = getResourceList();
      const uris = resources.map((r) => r.uri);
      const uniqueUris = new Set(uris);
      expect(uniqueUris.size).toBe(uris.length);
    });

    it("should have descriptive names and descriptions", () => {
      const resources = getResourceList();

      for (const resource of resources) {
        expect(resource.name).toContain("Best Practices");
        expect(resource.description.toLowerCase()).toContain("best practices");
      }
    });
  });
});
