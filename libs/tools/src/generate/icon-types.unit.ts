import { describe, expect, it, vi } from "vitest";
import { sanitizeIconName } from "./icon-types";

// Mock fs module
vi.mock("node:fs", () => ({
  writeFileSync: vi.fn()
}));

describe("icon-types", () => {
  describe("sanitizeIconName", () => {
    it("should convert kebab-case to PascalCase", () => {
      expect(sanitizeIconName("a-arrow-down")).toBe("AArrowDown");
      expect(sanitizeIconName("check-circle")).toBe("CheckCircle");
      expect(sanitizeIconName("heart")).toBe("Heart");
    });

    it("should handle single character names", () => {
      expect(sanitizeIconName("a")).toBe("A");
    });

    it("should handle multiple hyphens", () => {
      expect(sanitizeIconName("align-horizontal-distribute-center")).toBe(
        "AlignHorizontalDistributeCenter"
      );
    });

    it("should handle numbers", () => {
      expect(sanitizeIconName("2fa")).toBe("Icon2fa");
    });

    it("should handle empty string", () => {
      expect(sanitizeIconName("")).toBe("");
    });
  });

  describe("Icon Runtime Proxies Integration", () => {
    it("should be able to import Lucide namespace from runtime", async () => {
      const { Lucide } = await import("../../../components/src/icons-runtime");
      expect(Lucide).toBeDefined();
    });

    it("should be able to import Heroicons namespace from runtime", async () => {
      const { Heroicons } = await import("../../../components/src/icons-runtime");
      expect(Heroicons).toBeDefined();
    });

    it("should be able to import Tabler namespace from runtime", async () => {
      const { Tabler } = await import("../../../components/src/icons-runtime");
      expect(Tabler).toBeDefined();
    });

    it("should have proxy objects for icon namespaces", async () => {
      const { Lucide } = await import("../../../components/src/icons-runtime");
      // The proxy object should be defined and be an object
      expect(typeof Lucide).toBe("object");
      expect(Lucide).not.toBeNull();
    });
  });
});
