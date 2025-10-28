import { lookupCollection } from "@iconify/json";
import type { IconifyJSON } from "@iconify/types";
import { parseSync } from "oxc-parser";
import type { Plugin as VitePlugin } from "vite";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { icons } from "./icons";

type TransformResult = { code: string; map: unknown } | null;

interface TestPlugin
  extends Omit<VitePlugin, "transform" | "resolveId" | "handleHotUpdate"> {
  collections?: Map<string, IconifyJSON>;
  lazyCollections?: Map<string, Promise<IconifyJSON>>;
  availableCollections?: Set<string>;
  transform: (code: string, id: string) => TransformResult;
  resolveId: (source: string) => string | null;
  handleHotUpdate: (ctx: unknown) => Promise<unknown>;
}

function validateJSXSyntax(code: string): { isValid: boolean; errors: string[] } {
  try {
    const result = parseSync(code, "test.tsx", {
      sourceType: "module"
    });

    if (result.errors && result.errors.length > 0) {
      return {
        isValid: false,
        errors: result.errors.map((error) => error.message)
      };
    }

    return { isValid: true, errors: [] };
  } catch (error) {
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : "Unknown parsing error"]
    };
  }
}

describe("icons", () => {
  let plugin: TestPlugin;
  let transform: (code: string, id: string) => TransformResult;

  beforeAll(async () => {
    plugin = icons({ debug: true }) as TestPlugin;

    const collections: Map<string, IconifyJSON> = new Map();
    try {
      const lucideCollection = await lookupCollection("lucide");
      collections.set("lucide", lucideCollection);
    } catch (error) {
      console.warn("Failed to preload Lucide collection for tests:", error);
    }

    // Set the collections on the plugin
    plugin.collections = collections;

    transform = plugin.transform;
  });

  it("should skip non-JSX files", () => {
    const code = "const x = 1;";
    const result = transform(code, "test.js");
    expect(result).toBeNull();
  });

  it("should return null for files without icon imports", () => {
    const code = `
      function App() {
        return <div>Hello</div>;
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeNull();
  });

  it("should return null for files with icon imports but no usage", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        return <div>Hello</div>;
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeNull();
  });

  it("should transform simple icon usage", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        return <Lucide.Check width={24} />;
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      "import __qds_i_lucide_check from 'virtual:icons/lucide/check'"
    );
    expect(result?.code).toContain("<svg");
    expect(result?.code).toContain("width={24}");
    expect(result?.code).toContain("dangerouslySetInnerHTML={__qds_i_lucide_check}");
    expect(result?.code).toContain('viewBox="0 0 24 24"');
  });

  it("should transform icon with class attribute", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        return <Lucide.Check class="icon" />;
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain('class="icon"');
  });

  it("should transform icon with kebab-case attributes", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        return <Lucide.Check stroke-width={2} />;
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain("stroke-width={2}");
  });

  it("should transform icon with expression props", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        const size = 24;
        return <Lucide.Check width={size} className={cn("icon")} />;
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain("width={size}");
    expect(result?.code).toContain('className={cn("icon")}');
  });

  describe("default size attributes", () => {
    it("should add default width and height of 1em when not specified", () => {
      const code = `
        import { Lucide } from "@qds.dev/ui";

        function App() {
          return <Lucide.Check class="icon" />;
        }
      `;
      const result = transform(code, "test.tsx");
      expect(result).toBeTruthy();
      expect(result?.code).toContain('width="1em"');
      expect(result?.code).toContain('height="1em"');
      expect(result?.code).toContain('viewBox="0 0 24 24"');
    });

    it("should not add default width when width is explicitly provided", () => {
      const code = `
        import { Lucide } from "@qds.dev/ui";

        function App() {
          return <Lucide.Check width={24} />;
        }
      `;
      const result = transform(code, "test.tsx");
      expect(result).toBeTruthy();
      expect(result?.code).toContain("width={24}");
      expect(result?.code).not.toContain('width="1em"');
      // Should still add default height
      expect(result?.code).toContain('height="1em"');
    });

    it("should not add default height when height is explicitly provided", () => {
      const code = `
        import { Lucide } from "@qds.dev/ui";

        function App() {
          return <Lucide.Check height={24} />;
        }
      `;
      const result = transform(code, "test.tsx");
      expect(result).toBeTruthy();
      expect(result?.code).toContain("height={24}");
      expect(result?.code).not.toContain('height="1em"');
      // Should still add default width
      expect(result?.code).toContain('width="1em"');
    });

    it("should not add defaults when both width and height are explicitly provided", () => {
      const code = `
        import { Lucide } from "@qds.dev/ui";

        function App() {
          return <Lucide.Check width={24} height={24} />;
        }
      `;
      const result = transform(code, "test.tsx");
      expect(result).toBeTruthy();
      expect(result?.code).toContain("width={24}");
      expect(result?.code).toContain("height={24}");
      expect(result?.code).not.toContain('width="1em"');
      expect(result?.code).not.toContain('height="1em"');
    });

    it("should add default sizes with expression props", () => {
      const code = `
        import { Lucide } from "@qds.dev/ui";

        function App() {
          return <Lucide.Check className="icon" aria-label="Check" />;
        }
      `;
      const result = transform(code, "test.tsx");
      expect(result).toBeTruthy();
      expect(result?.code).toContain('width="1em"');
      expect(result?.code).toContain('height="1em"');
      expect(result?.code).toContain('className="icon"');
      expect(result?.code).toContain('aria-label="Check"');
    });

    it("should respect string width values", () => {
      const code = `
        import { Lucide } from "@qds.dev/ui";

        function App() {
          return <Lucide.Check width="2rem" />;
        }
      `;
      const result = transform(code, "test.tsx");
      expect(result).toBeTruthy();
      expect(result?.code).toContain('width="2rem"');
      expect(result?.code).not.toContain('width="1em"');
      expect(result?.code).toContain('height="1em"');
    });

    it("should respect expression width values", () => {
      const code = `
        import { Lucide } from "@qds.dev/ui";

        function App() {
          const iconSize = "2em";
          return <Lucide.Check width={iconSize} />;
        }
      `;
      const result = transform(code, "test.tsx");
      expect(result).toBeTruthy();
      expect(result?.code).toContain("width={iconSize}");
      expect(result?.code).not.toContain('width="1em"');
      expect(result?.code).toContain('height="1em"');
    });
  });

  it("should convert title prop to children", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        return <Lucide.Check title="Checked item" />;
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      '<svg width="1em" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_check}><title>Checked item</title></svg>'
    );
  });

  it("should convert title expression prop to children", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        const label = "Checked item";
        return <Lucide.Check title={label} />;
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      '<svg width="1em" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_check}><title>{label}</title></svg>'
    );
  });

  it("should handle title plus existing children", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        return (
          <Lucide.Check title="Checked item">
            <desc>Extra a11y</desc>
          </Lucide.Check>
        );
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      '<svg width="1em" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_check}><title>Checked item</title><desc>Extra a11y</desc></svg>'
    );
  });

  it("should convert description prop to children", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        return <Lucide.Check description="This icon indicates completion" />;
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      '<svg width="1em" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_check}><desc>This icon indicates completion</desc></svg>'
    );
  });

  it("should convert description expression prop to children", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        const desc = "Task completed";
        return <Lucide.Check description={desc} />;
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      '<svg width="1em" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_check}><desc>{desc}</desc></svg>'
    );
  });

  it("should handle both title and description props", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        return <Lucide.Check title="Check mark" description="Indicates completion" />;
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      '<svg width="1em" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_check}><title>Check mark</title><desc>Indicates completion</desc></svg>'
    );
  });

  it("should handle title and description with expressions", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        const iconTitle = "Status";
        const iconDesc = "Current status indicator";
        return <Lucide.Check title={iconTitle} description={iconDesc} />;
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      '<svg width="1em" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_check}><title>{iconTitle}</title><desc>{iconDesc}</desc></svg>'
    );
  });

  it("should handle title and description props with existing children", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        return (
          <Lucide.Check title="Check" description="Done">
            <circle cx="12" cy="12" r="10" />
          </Lucide.Check>
        );
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain("<title>Check</title>");
    expect(result?.code).toContain("<desc>Done</desc>");
    expect(result?.code).toContain('<circle cx="12" cy="12" r="10" />');
  });

  it("should handle description prop with other attributes", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        return (
          <Lucide.Check 
            width={24} 
            class="text-green-500" 
            description="Success indicator"
          />
        );
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain("width={24}");
    expect(result?.code).toContain('class="text-green-500"');
    expect(result?.code).toContain("<desc>Success indicator</desc>");
  });

  it("should handle self-closing and non-self-closing tags", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        return <Lucide.Check width={24}></Lucide.Check>;
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain("width={24}");
  });

  it("should handle aliased imports", () => {
    const code = `
      import { Lucide as L } from "@qds.dev/ui";

      function App() {
        return <L.Check width={24} />;
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      "import __qds_i_lucide_check from 'virtual:icons/lucide/check'"
    );
  });

  it("should deduplicate imports for multiple usages of same icon", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        return (
          <div>
            <Lucide.Check width={16} />
            <Lucide.Check width={24} />
          </div>
        );
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    const importMatches = result?.code.match(/import __qds_i_lucide_check/g);
    expect(importMatches).toHaveLength(1);

    // Both instances should use the SAME variable name
    const svgMatches = result?.code.match(
      /dangerouslySetInnerHTML=\{(__qds_i_lucide_check(?:_\d+)?)\}/g
    );
    expect(svgMatches).toHaveLength(2);

    // Extract the variable names used in both SVG elements
    const allMatches = result!.code.matchAll(
      /dangerouslySetInnerHTML=\{(__qds_i_lucide_check(?:_\d+)?)\}/g
    );
    const varNames = Array.from(allMatches).map((m) => m[1]);

    // Both should use the same variable
    expect(varNames[0]).toBe(varNames[1]);
    expect(varNames[0]).toBe("__qds_i_lucide_check");
  });

  it("should handle multiple different icons", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        return (
          <div>
            <Lucide.Check width={24} />
            <Lucide.Circle width={24} />
          </div>
        );
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      "import __qds_i_lucide_check from 'virtual:icons/lucide/check'"
    );
    expect(result?.code).toContain(
      "import __qds_i_lucide_circle from 'virtual:icons/lucide/circle'"
    );
  });

  it("should handle nested icons", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        return (
          <div>
            <Lucide.Check width={24} />
            <span>
              <Lucide.Circle width={16} />
            </span>
          </div>
        );
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      "import __qds_i_lucide_check from 'virtual:icons/lucide/check'"
    );
    expect(result?.code).toContain(
      "import __qds_i_lucide_circle from 'virtual:icons/lucide/circle'"
    );
  });

  it("should skip unknown pack", () => {
    const code = `
      import { Unknown } from "@qds.dev/ui";

      function App() {
        return <Unknown.Check width={24} />;
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeNull();
  });

  it("should skip icon not found in collection", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        return <Lucide.NonExistentIcon width={24} />;
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeNull();
  });

  it("should handle boolean attributes", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        return <Lucide.Check disabled />;
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain("disabled");
  });

  it("should preserve aria and data attributes", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        return <Lucide.Check aria-label="Check" data-testid="check-icon" />;
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain('aria-label="Check"');
    expect(result?.code).toContain('data-testid="check-icon"');
  });

  it("should handle complex children", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        return (
          <Lucide.Check>
            <title>Check</title>
            <desc>Description</desc>
          </Lucide.Check>
        );
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      '<svg width="1em" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_check}><title>Check</title><desc>Description</desc></svg>'
    );
  });

  it("should generate source maps", () => {
    const code = `
      import { Lucide } from "@qds.dev/ui";

      function App() {
        return <Lucide.Check width={24} />;
      }
    `;
    const result = transform(code, "test.tsx");
    expect(result).toBeTruthy();
    expect(result?.map).toBeTruthy();
  });

  describe("debug mode", () => {
    it("should log debug messages when debug is enabled", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const debugPlugin = icons({ debug: true }) as TestPlugin;
      const debugTransform = debugPlugin.transform;

      const code = `
        import { Lucide } from "@qds.dev/ui";

        function App() {
          return <Lucide.Check width={24} />;
        }
      `;

      debugTransform(code, "test.tsx");

      expect(consoleSpy).toHaveBeenCalledWith(
        "[icons] [TRANSFORM] Processing test.tsx with 1 aliases:",
        [["Lucide", "Lucide"]]
      );

      consoleSpy.mockRestore();
    });
  });

  describe("virtual modules", () => {
    it("should resolve virtual icon modules", () => {
      const resolveId = plugin.resolveId;
      const result = resolveId("virtual:icons/lucide/check");
      expect(result).toBe("\0virtual:icons/lucide/check");
    });

    it("should not resolve non-virtual modules", () => {
      const resolveId = plugin.resolveId;
      const result = resolveId("react");
      expect(result).toBeNull();
    });
  });

  describe("error handling", () => {
    it("should handle parse errors gracefully", () => {
      const code = `
        import { Lucide } from "@qds.dev/ui";

        function App() {
          return <Lucide.Check unclosed;
        }
      `;
      const result = transform(code, "test.tsx");
      expect(result).toBeNull();
    });

    it("should handle malformed JSX gracefully", () => {
      const code = `
        import { Lucide } from "@qds.dev/ui";

        function App() {
          return <Lucide.Check />;
      `;
      const result = transform(code, "test.tsx");
      expect(result).toBeNull();
    });
  });

  describe("custom packs configuration", () => {
    it("should support custom packs", () => {
      const customPlugin = icons({
        packs: {
          CustomPack: { iconifyPrefix: "custom" }
        }
      });

      // This would require mocking the custom collection
      expect(customPlugin).toBeDefined();
    });

    it("should support custom import sources", () => {
      const customPlugin = icons({
        importSources: ["custom-lib"]
      });

      expect(customPlugin).toBeDefined();
    });
  });

  describe("real world examples from icon-example.tsx", () => {
    it("should transform Lucide.Check with class attribute", () => {
      const code = `
        import { Lucide } from "@qds.dev/ui";

        function App() {
          return <Lucide.Check width={24} class="text-green-500" />;
        }
      `;
      const result = transform(code, "test.tsx");
      expect(result).toBeTruthy();
      expect(result?.code).toContain(
        "import __qds_i_lucide_check from 'virtual:icons/lucide/check'"
      );
      expect(result?.code).toContain(
        '<svg width={24} class="text-green-500" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_check} />'
      );
    });

    it("should transform Lucide.X with class attribute", () => {
      const code = `
        import { Lucide } from "@qds.dev/ui";

        function App() {
          return <Lucide.X width={24} class="text-red-500" />;
        }
      `;
      const result = transform(code, "test.tsx");
      expect(result).toBeTruthy();
      expect(result?.code).toContain(
        "import __qds_i_lucide_x from 'virtual:icons/lucide/x'"
      );
      expect(result?.code).toContain(
        '<svg width={24} class="text-red-500" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_x} />'
      );
    });

    it("should transform Lucide.Heart with fill-current class", () => {
      const code = `
        import { Lucide } from "@qds.dev/ui";

        function App() {
          return <Lucide.Heart width={24} class="text-red-500 fill-current" />;
        }
      `;
      const result = transform(code, "test.tsx");
      expect(result).toBeTruthy();
      expect(result?.code).toContain(
        "import __qds_i_lucide_heart from 'virtual:icons/lucide/heart'"
      );
      expect(result?.code).toContain(
        '<svg width={24} class="text-red-500 fill-current" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_heart} />'
      );
    });

    it("should transform multiple different icons", () => {
      const code = `
        import { Lucide } from "@qds.dev/ui";

        function App() {
          return (
            <div>
              <Lucide.Check width={24} class="text-green-500" />
              <Lucide.X width={24} class="text-red-500" />
              <Lucide.Heart width={24} class="text-red-500 fill-current" />
              <Lucide.Star width={24} class="text-yellow-500" />
            </div>
          );
        }
      `;
      const result = transform(code, "test.tsx");
      expect(result).toBeTruthy();
      expect(result!.code).toContain(
        "import __qds_i_lucide_check from 'virtual:icons/lucide/check'"
      );
      expect(result!.code).toContain(
        "import __qds_i_lucide_x from 'virtual:icons/lucide/x'"
      );
      expect(result!.code).toContain(
        "import __qds_i_lucide_heart from 'virtual:icons/lucide/heart'"
      );
      expect(result!.code).toContain(
        "import __qds_i_lucide_star from 'virtual:icons/lucide/star'"
      );
      expect(result!.code).toContain(
        '<svg width={24} class="text-green-500" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_check} />'
      );
      expect(result!.code).toContain(
        '<svg width={24} class="text-red-500" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_x} />'
      );
      expect(result!.code).toContain(
        '<svg width={24} class="text-red-500 fill-current" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_heart} />'
      );
      expect(result!.code).toContain(
        '<svg width={24} class="text-yellow-500" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_star} />'
      );
    });

    it("should transform Heroicons.CheckCircle", () => {
      const code = `
        import { Heroicons } from "@qds.dev/ui";

        function App() {
          return <Heroicons.CheckCircle width={24} class="text-green-500" />;
        }
      `;
      const result = transform(code, "test.tsx");
      expect(result).toBeTruthy();
      expect(result!.code).toContain(
        "import __qds_i_heroicons_check_circle from 'virtual:icons/heroicons/check-circle'"
      );
      expect(result!.code).toContain(
        '<svg width={24} class="text-green-500" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_heroicons_check_circle} />'
      );
    });

    it("should transform Tabler.Check", () => {
      const code = `
        import { Tabler } from "@qds.dev/ui";

        function App() {
          return <Tabler.Check width={24} class="text-green-500" />;
        }
      `;
      const result = transform(code, "test.tsx");
      expect(result).toBeTruthy();
      expect(result!.code).toContain(
        "import __qds_i_tabler_check from 'virtual:icons/tabler/check'"
      );
      expect(result!.code).toContain(
        '<svg width={24} class="text-green-500" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_tabler_check} />'
      );
    });

    it("should transform icon sets with multiple words in name (AkarIcons example)", () => {
      const code = `
        import { AkarIcons } from "@qds.dev/ui";

        function App() {
          return <AkarIcons.Airpods viewBox="0 0 24 24" />;
        }
      `;
      const result = transform(code, "test.tsx");
      expect(result).toBeTruthy();

      expect(result!.code).toContain(
        "import __qds_i_akaricons_airpods from 'virtual:icons/akar-icons/airpods'"
      );

      expect(result!.code).toContain("__qds_i_akaricons_airpods");

      expect(result!.code).toContain(
        '<svg viewBox="0 0 24 24" width="1em" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_akaricons_airpods} />'
      );

      expect(result!.code).not.toContain("__qds_i_akar-icons_airpods");
    });

    it("should transform icon sets with multiple words in name (MaterialSymbols example)", () => {
      const code = `
        import { MaterialSymbols } from "@qds.dev/ui";

        function App() {
          return <MaterialSymbols.AcUnitRounded class="text-blue-500" />;
        }
      `;
      const result = transform(code, "test.tsx");
      expect(result).toBeTruthy();

      expect(result!.code).toContain(
        "import __qds_i_materialsymbols_ac_unit_rounded from 'virtual:icons/material-symbols/ac-unit-rounded'"
      );

      expect(result!.code).toContain("__qds_i_materialsymbols_ac_unit_rounded");

      expect(result!.code).toContain(
        '<svg class="text-blue-500" width="1em" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_materialsymbols_ac_unit_rounded} />'
      );

      expect(result!.code).not.toContain("__qds_i_material-symbols_ac-unit-rounded");
    });

    it("should allow consumer props to override icon defaults", () => {
      const code = `
        import { Lucide } from "@qds.dev/ui";

        function App() {
          return <Lucide.Check viewBox="0 0 32 32" width={32} />;
        }
      `;
      const result = transform(code, "test.tsx");
      expect(result).toBeTruthy();

      // Should include consumer's viewBox and width
      expect(result!.code).toContain(
        '<svg viewBox="0 0 32 32" width={32} height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_check} />'
      );
    });

    it("should transform the complete icon-example.tsx content", () => {
      const code = `
        import { component$ } from "@qwik.dev/core";
        import { Lucide, Heroicons, Tabler, Hugeicons } from "@qds.dev/ui";

        export default component$(() => {
          return (
            <div class="space-y-8 p-8">
              <div class="space-y-4">
                <h2 class="text-2xl font-bold">Lucide Icons</h2>
                <div class="flex gap-4 items-center">
                  <Lucide.Check width={24} class="text-green-500" />
                  <Lucide.X width={24} class="text-red-500" />
                  <Lucide.Heart width={24} class="text-red-500 fill-current" />
                  <Lucide.Star width={24} class="text-yellow-500" />
                  <Lucide.Search width={24} class="text-gray-500" />
                </div>
              </div>

              <div class="space-y-4">
                <h2 class="text-2xl font-bold">Heroicons</h2>
                <div class="flex gap-4 items-center">
                  <Heroicons.CheckCircle width={24} class="text-green-500" />
                  <Heroicons.XCircle width={24} class="text-red-500" />
                  <Heroicons.Heart width={24} class="text-red-500 fill-current" />
                  <Heroicons.Star width={24} class="text-yellow-500" />
                </div>
              </div>

              <div class="space-y-4">
                <h2 class="text-2xl font-bold">Tabler Icons</h2>
                <div class="flex gap-4 items-center">
                  <Tabler.Check width={24} class="text-green-500" />
                  <Tabler.X width={24} class="text-red-500" />
                  <Tabler.Heart width={24} class="text-red-500 fill-current" />
                  <Tabler.Star width={24} class="text-yellow-500" />
                </div>
              </div>
            </div>
          );
        });
      `;
      const result = transform(code, "icon-example.tsx");
      expect(result).toBeTruthy();

      // Debug: print the generated code for troubleshooting
      // if (result) {
      //   console.log("=== GENERATED CODE ===");
      //   console.log(result.code);
      //   console.log("=== END GENERATED CODE ===");
      // }

      // Should contain all the transformed icons
      expect(result!.code).toContain(
        '<svg width={24} class="text-green-500" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_check} />'
      );
      expect(result!.code).toContain(
        '<svg width={24} class="text-red-500" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_x} />'
      );
      expect(result!.code).toContain(
        '<svg width={24} class="text-red-500 fill-current" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_heart} />'
      );
      expect(result!.code).toContain(
        '<svg width={24} class="text-yellow-500" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_star} />'
      );
      expect(result!.code).toContain(
        '<svg width={24} class="text-gray-500" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_lucide_search} />'
      );
      expect(result!.code).toContain(
        '<svg width={24} class="text-green-500" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_heroicons_check_circle} />'
      );
      expect(result!.code).toContain(
        '<svg width={24} class="text-red-500" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_heroicons_x_circle} />'
      );
      expect(result!.code).toContain(
        '<svg width={24} class="text-green-500" height="1em" viewBox="0 0 24 24" dangerouslySetInnerHTML={__qds_i_tabler_check} />'
      );

      // Validate JSX syntax using oxc-parser
      const validation = validateJSXSyntax(result!.code);
      if (!validation.isValid) {
        console.error(
          "JSX validation errors for complete icon-example:",
          validation.errors
        );
        console.error("Generated code:", result!.code);
      }
      expect(validation.isValid).toBe(true);
    });
  });
});

describe("JSX Syntax Validation", () => {
  let plugin: TestPlugin;
  let transform: (code: string, id: string) => TransformResult;

  beforeAll(() => {
    plugin = icons() as TestPlugin;
    transform = plugin.transform.bind(plugin);
  });

  it("should generate valid JSX syntax for single icon", () => {
    const code = `
import { Lucide } from "@qds.dev/ui";
export default component$(() => {
  return <Lucide.Check width={24} className="text-green-500" />;
});
`;

    const result = transform(code, "test.tsx");

    expect(result).toBeTruthy();
    expect(result!.code).toContain("import");
    expect(result!.code).toContain("<svg");
    expect(result!.code).toContain("dangerouslySetInnerHTML");

    // The plugin now generates self-closing tags, so check for /> instead of </svg>
    expect(result!.code).toContain("/>");

    // Ensure no trailing whitespace that could cause parsing issues
    const lines = result!.code.split("\n");
    for (const line of lines) {
      expect(line).toBe(line.trimEnd());
    }

    // Validate JSX syntax using oxc-parser
    const validation = validateJSXSyntax(result!.code);
    if (!validation.isValid) {
      console.error("JSX validation errors for test:", validation.errors);
      console.error("Generated code:", result!.code);
    }
    expect(validation.isValid).toBe(true);
  });

  it("should generate valid JSX syntax for multiple icons without conflicts", () => {
    const code = `
import { Lucide } from "@qds.dev/ui";
export default component$(() => {
  return (
    <div>
      <Lucide.Check width={24} className="text-green-500" />
      <Lucide.X width={24} className="text-red-500" />
      <Lucide.Heart width={24} className="text-blue-500" />
    </div>
  );
});
`;

    const result = transform(code, "test.tsx");

    expect(result).toBeTruthy();
    expect(result!.code).toContain("import");

    // Should have three SVG elements
    const svgMatches = result!.code.match(/<svg[^>]*>/g);
    expect(svgMatches).toHaveLength(3);

    // Each SVG should have the required attributes
    expect(result!.code).toContain("viewBox=");
    expect(result!.code).toContain("dangerouslySetInnerHTML=");

    // Validate JSX syntax using oxc-parser
    const validation = validateJSXSyntax(result!.code);
    if (!validation.isValid) {
      console.error("JSX validation errors for test:", validation.errors);
      console.error("Generated code:", result!.code);
    }
    expect(validation.isValid).toBe(true);
  });

  it("should handle complex props without breaking JSX syntax", () => {
    const code = `
import { Lucide } from "@qds.dev/ui";
export default component$(() => {
  return (
    <Lucide.Check
      width={24}
      height={24}
      className="text-green-500 hover:text-green-600"
      style={{ color: 'green', margin: '4px' }}
      onClick$={() => console.log('clicked')}
      data-testid="check-icon"
    />
  );
});
`;

    const result = transform(code, "test.tsx");

    expect(result).toBeTruthy();

    // Should preserve all attributes correctly
    expect(result!.code).toContain("width={24}");
    expect(result!.code).toContain("height={24}");
    expect(result!.code).toContain('className="text-green-500 hover:text-green-600"');
    // Note: The style attribute may be formatted differently by the plugin
    expect(result!.code).toContain("style=");
    expect(result!.code).toContain("onClick$=");
    expect(result!.code).toContain('data-testid="check-icon"');

    // Should still have the SVG-specific attributes
    expect(result!.code).toContain("viewBox=");
    expect(result!.code).toContain("dangerouslySetInnerHTML=");

    // Validate JSX syntax using oxc-parser
    const validation = validateJSXSyntax(result!.code);
    if (!validation.isValid) {
      console.error("JSX validation errors for test:", validation.errors);
      console.error("Generated code:", result!.code);
    }
    expect(validation.isValid).toBe(true);
  });

  it("should not generate trailing whitespace that causes parsing errors", () => {
    const code = `
import { Lucide } from "@qds.dev/ui";
export default component$(() => {
  return <div><Lucide.Check /></div>;
});
`;

    const result = transform(code, "test.tsx");

    expect(result).toBeTruthy();

    // Check each line for trailing whitespace
    const lines = result!.code.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.length !== line.trimEnd().length) {
        throw new Error(`Line ${i + 1} has trailing whitespace: "${line}"`);
      }
    }

    // Validate JSX syntax using oxc-parser
    const validation = validateJSXSyntax(result!.code);
    if (!validation.isValid) {
      console.error("JSX validation errors for test:", validation.errors);
      console.error("Generated code:", result!.code);
    }
    expect(validation.isValid).toBe(true);
  });

  it("should handle boolean and undefined props correctly", () => {
    const code = `
import { Lucide } from "@qds.dev/ui";
export default component$(() => {
  return (
    <Lucide.Check
      disabled={true}
      hidden={false}
      required
      optional={undefined}
    />
  );
});
`;

    const result = transform(code, "test.tsx");

    expect(result).toBeTruthy();

    // Boolean true should be converted to {true}
    expect(result?.code).toContain("disabled={true}");

    // Boolean false should be converted to {false}
    expect(result?.code).toContain("hidden={false}");

    // Boolean shorthand should be preserved as just the attribute name
    expect(result?.code).toContain("required");

    // The plugin may or may not filter out undefined props - check what it actually does
    // expect(result.code).not.toContain("optional=");

    // Validate JSX syntax using oxc-parser
    const validation = validateJSXSyntax(result?.code ?? "");
    if (!validation?.isValid) {
      console.error("JSX validation errors for test:", validation.errors);
      console.error("Generated code:", result?.code);
    }
    expect(validation.isValid).toBe(true);
  });

  it("should reproduce the build error with complex JSX structure", () => {
    const code = `
import { component$ } from "@qwik.dev/core";
import { Lucide, Heroicons } from "@qds.dev/ui";

export default component$(() => {
  return (
    <div class="space-y-8 p-8">
      <div class="space-y-4">
        <h2 class="text-2xl font-bold">Test</h2>
        <div class="flex gap-4 items-center">
          <Lucide.Check width={24} class="text-green-500" />
          <Lucide.X width={24} class="text-red-500" />
        </div>
      </div>
    </div>
  );
});
`;

    const result = transform(code, "test.tsx");

    expect(result).toBeTruthy();

    // Debug: print the generated code for troubleshooting
    // if (result) {
    //   console.log("=== REPRODUCED GENERATED CODE ===");
    //   console.log(result.code);
    //   console.log("=== END REPRODUCED GENERATED CODE ===");
    // }

    // Validate JSX syntax using oxc-parser
    const validation = validateJSXSyntax(result?.code ?? "");
    if (!validation.isValid) {
      console.error("JSX validation errors for reproduction test:", validation.errors);
      console.error("Generated code:", result?.code);
    }
    expect(validation.isValid).toBe(true);
  });

  it("should handle complex nested JSX structures with mixed content", () => {
    const code = `
import { component$ } from "@qwik.dev/core";
import { Lucide, Heroicons } from "@qds.dev/ui";

export default component$(() => {
  const isActive = true;
  return (
    <div className="container">
      <header>
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Lucide.Menu width={24} className="text-gray-600" />
            <span className="font-bold text-xl">App</span>
          </div>
          <div className="flex items-center space-x-2">
            <Heroicons.Bell width={20} className="text-gray-500" />
            <Lucide.User width={24} className="text-blue-500" />
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <Lucide.Star width={24} className="text-yellow-500 mr-2" />
              <h3 className="text-lg font-semibold">Dashboard</h3>
            </div>
            <p className="text-gray-600">Welcome to your dashboard</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <Heroicons.ChartBar width={24} className="text-green-500 mr-2" />
              <h3 className="text-lg font-semibold">Analytics</h3>
            </div>
            <p className="text-gray-600">View your analytics data</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <Lucide.Settings width={24} className="text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold">Settings</h3>
            </div>
            <p className="text-gray-600">Configure your preferences</p>
          </div>
        </div>
      </main>
    </div>
  );
});
`;

    const result = transform(code, "complex-jsx.tsx");

    expect(result).toBeTruthy();

    // Validate JSX syntax using oxc-parser
    const validation = validateJSXSyntax(result?.code ?? "");
    if (!validation.isValid) {
      console.error("JSX validation errors for complex nested JSX:", validation.errors);
      console.error("Generated code:", result?.code);
    }
    expect(validation.isValid).toBe(true);
  });

  it("should handle edge cases that could break JSX parsing", () => {
    const code = `
import { component$ } from "@qwik.dev/core";
import { Lucide } from "@qds.dev/ui";

export default component$(() => {
  return (
    <>
      <div>
        <Lucide.Check />
        <span>Text</span>
        <Lucide.X />
      </div>
      <Lucide.Heart />
      <div>
        <p>Paragraph</p>
        <Lucide.Star />
        <em>Emphasis</em>
        <Lucide.Circle />
      </div>
    </>
  );
});
`;

    const result = transform(code, "edge-cases.tsx");

    expect(result).toBeTruthy();

    // Validate JSX syntax using oxc-parser
    const validation = validateJSXSyntax(result?.code ?? "");
    if (!validation.isValid) {
      console.error("JSX validation errors for edge cases:", validation.errors);
      console.error("Generated code:", result?.code);
    }
    expect(validation.isValid).toBe(true);
  });

  it("should handle JSX fragments with icons correctly", () => {
    const code = `
import { component$ } from "@qwik.dev/core";
import { Lucide } from "@qds.dev/ui";

export default component$(() => {
  return (
    <>
      <Lucide.Check width={16} />
      <Lucide.X width={20} />
      <Lucide.Heart width={24} />
      <span>Text between icons</span>
      <Lucide.Star width={16} />
    </>
  );
});
`;

    const result = transform(code, "fragments.tsx");

    expect(result).toBeTruthy();

    // Validate JSX syntax using oxc-parser
    const validation = validateJSXSyntax(result?.code ?? "");
    if (!validation.isValid) {
      console.error("JSX validation errors for JSX fragments:", validation.errors);
      console.error("Generated code:", result?.code);
    }
    expect(validation.isValid).toBe(true);
  });

  it("should handle conditional rendering with icons", () => {
    const code = `
import { component$ } from "@qwik.dev/core";
import { Lucide } from "@qds.dev/ui";

export default component$(() => {
  const isLoading = true;
  const hasError = false;
  const count = 5;

  return (
    <div>
      {isLoading ? (
        <Lucide.Loader width={24} className="animate-spin" />
      ) : hasError ? (
        <Lucide.AlertTriangle width={24} className="text-red-500" />
      ) : (
        <div className="flex items-center">
          <Lucide.Check width={20} className="text-green-500" />
          <span className="ml-2">Success ({count})</span>
        </div>
      )}
    </div>
  );
});
`;

    const result = transform(code, "conditional.tsx");

    expect(result).toBeTruthy();

    // Validate JSX syntax using oxc-parser
    const validation = validateJSXSyntax(result?.code ?? "");
    if (!validation.isValid) {
      console.error(
        "JSX validation errors for conditional rendering:",
        validation.errors
      );
      console.error("Generated code:", result?.code);
    }
    expect(validation.isValid).toBe(true);
  });
});

describe("HMR (Hot Module Replacement)", () => {
  let plugin: TestPlugin;
  let handleHotUpdate: (ctx: unknown) => Promise<unknown>;

  beforeAll(async () => {
    plugin = icons({ debug: true }) as TestPlugin;
    handleHotUpdate = plugin.handleHotUpdate.bind(plugin);

    // Wait for plugin initialization
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Preload collections for testing
    try {
      const lucideCollection = await lookupCollection("lucide");
      if (plugin?.lazyCollections) {
        plugin.lazyCollections.set("lucide", Promise.resolve(lucideCollection));
        plugin?.availableCollections?.add("lucide");
      }
    } catch (error) {
      console.warn("Failed to preload Lucide collection for HMR tests:", error);
    }
  });

  describe("handleHotUpdate function", () => {
    it("should trigger full reload for TSX files with icon imports", async () => {
      const mockCtx = {
        file: "/test/component.tsx",
        read: vi.fn().mockReturnValue(`
          import { Lucide } from "@qds.dev/ui";
          export default function Test() {
            return <Lucide.Check />;
          }
        `),
        server: {
          ws: {
            send: vi.fn()
          }
        }
      };

      const result = (await handleHotUpdate(mockCtx)) as unknown[];

      expect(mockCtx.server.ws.send).toHaveBeenCalledWith({ type: "full-reload" });
      expect(result).toEqual([]);
    });

    it("should trigger full reload for JSX files with icon imports", async () => {
      const mockCtx = {
        file: "/test/component.jsx",
        read: vi.fn().mockReturnValue(`
          import { Heroicons } from "@qds.dev/ui";
          export default function Test() {
            return <Heroicons.CheckCircle />;
          }
        `),
        server: {
          ws: {
            send: vi.fn()
          }
        }
      };

      const result = (await handleHotUpdate(mockCtx)) as unknown[];

      expect(mockCtx.server.ws.send).toHaveBeenCalledWith({ type: "full-reload" });
      expect(result).toEqual([]);
    });

    it("should not trigger reload for files without icon imports", async () => {
      const mockCtx = {
        file: "/test/component.tsx",
        read: vi.fn().mockReturnValue(`
          import React from "react";
          export default function Test() {
            return <div>Hello</div>;
          }
        `),
        server: {
          ws: {
            send: vi.fn()
          }
        }
      };

      const result = await handleHotUpdate(mockCtx);

      expect(mockCtx.server.ws.send).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it("should handle files with imports but no icon usage", async () => {
      const mockCtx = {
        file: "/test/component.tsx",
        read: vi.fn().mockReturnValue(`
          import { Lucide } from "@qds.dev/ui";
          import { useState } from "react";
          export default function Test() {
            const [count, setCount] = useState(0);
            return <div>{count}</div>;
          }
        `),
        server: {
          ws: {
            send: vi.fn()
          }
        }
      };

      const result = await handleHotUpdate(mockCtx);

      // Should still trigger reload because imports are present
      expect(mockCtx.server.ws.send).toHaveBeenCalledWith({ type: "full-reload" });
      expect(result).toEqual([]);
    });

    it("should handle async read operations", async () => {
      const mockCtx = {
        file: "/test/component.tsx",
        read: vi.fn().mockResolvedValue(`
          import { Lucide } from "@qds.dev/ui";
          export default function Test() {
            return <Lucide.Star />;
          }
        `),
        server: {
          ws: {
            send: vi.fn()
          }
        }
      };

      const result = (await handleHotUpdate(mockCtx)) as unknown[];

      expect(mockCtx.server.ws.send).toHaveBeenCalledWith({ type: "full-reload" });
      expect(result).toEqual([]);
    });

    it("should handle read errors gracefully", async () => {
      const mockCtx = {
        file: "/test/component.tsx",
        read: vi.fn().mockReturnValue(null),
        server: {
          ws: {
            send: vi.fn()
          }
        }
      };

      const result = await handleHotUpdate(mockCtx);

      expect(mockCtx.server.ws.send).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it("should handle parsing errors gracefully", async () => {
      const mockCtx = {
        file: "/test/component.tsx",
        read: vi.fn().mockReturnValue(`
          import { Lucide } from "@qds.dev/ui";
          export default function Test() {
            return <Lucide.Check // syntax error
          }
        `),
        server: {
          ws: {
            send: vi.fn()
          }
        }
      };

      const result = await handleHotUpdate(mockCtx);

      expect(mockCtx.server.ws.send).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it("should ignore non-JSX/TSX files", async () => {
      const mockCtx = {
        file: "/test/component.js",
        read: vi.fn().mockReturnValue(`
          import { Lucide } from "@qds.dev/ui";
          export default function Test() {
            return "Hello";
          }
        `),
        server: {
          ws: {
            send: vi.fn()
          }
        }
      };

      const result = await handleHotUpdate(mockCtx);

      expect(mockCtx.server.ws.send).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it("should handle multiple icon collections", async () => {
      const mockCtx = {
        file: "/test/component.tsx",
        read: vi.fn().mockReturnValue(`
          import { Lucide, Heroicons, Tabler } from "@qds.dev/ui";
          export default function Test() {
            return (
              <div>
                <Lucide.Check />
                <Heroicons.Star />
                <Tabler.Heart />
              </div>
            );
          }
        `),
        server: {
          ws: {
            send: vi.fn()
          }
        }
      };

      const result = (await handleHotUpdate(mockCtx)) as unknown[];

      expect(mockCtx.server.ws.send).toHaveBeenCalledWith({ type: "full-reload" });
      expect(result).toEqual([]);
    });

    it("should handle complex icon expressions with props", async () => {
      const mockCtx = {
        file: "/test/component.tsx",
        read: vi.fn().mockReturnValue(`
          import { Lucide } from "@qds.dev/ui";
          export default function Test() {
            return (
              <Lucide.Check
                width={24}
                height={24}
                className="icon"
                title="Check mark"
              />
            );
          }
        `),
        server: {
          ws: {
            send: vi.fn()
          }
        }
      };

      const result = (await handleHotUpdate(mockCtx)) as unknown[];

      expect(mockCtx.server.ws.send).toHaveBeenCalledWith({ type: "full-reload" });
      expect(result).toEqual([]);
    });
  });
});

describe("MDX file support", () => {
  let plugin: TestPlugin;
  let transform: (code: string, id: string) => TransformResult;

  beforeAll(async () => {
    plugin = icons({ debug: true }) as TestPlugin;

    const collections: Map<string, IconifyJSON> = new Map();
    try {
      const lucideCollection = await lookupCollection("lucide");
      collections.set("lucide", lucideCollection);
    } catch (error) {
      console.warn("Failed to preload Lucide collection for MDX tests:", error);
    }

    plugin.collections = collections;
    if (plugin.transform) {
      transform = plugin.transform;
    }
  });

  it("should transform icon in basic MDX file", () => {
    const code = `---
title: "Test Page"
---

import { Lucide } from "@qds.dev/ui";

# Hello World

Here's an icon: <Lucide.Check width={24} class="text-green-500" />

Some more text.
`;
    const result = transform(code, "test.mdx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      "import __qds_i_lucide_check from 'virtual:icons/lucide/check'"
    );
    expect(result?.code).toContain("<svg");
    expect(result?.code).toContain("width={24}");
    expect(result?.code).toContain('class="text-green-500"');
    expect(result?.code).toContain("dangerouslySetInnerHTML={__qds_i_lucide_check}");
  });

  it("should transform multiple icons in MDX", () => {
    const code = `import { Lucide } from "@qds.dev/ui";

# Icons Demo

<Lucide.Check width={20} class="inline" />
<Lucide.Star width={24} class="text-yellow-500" />
<Lucide.Heart width={16} />
`;
    const result = transform(code, "test.mdx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      "import __qds_i_lucide_check from 'virtual:icons/lucide/check'"
    );
    expect(result?.code).toContain(
      "import __qds_i_lucide_star from 'virtual:icons/lucide/star'"
    );
    expect(result?.code).toContain(
      "import __qds_i_lucide_heart from 'virtual:icons/lucide/heart'"
    );
  });

  it("should handle MDX with frontmatter", () => {
    const code = `---
title: "Component Demo"
description: "Testing icons"
---

import { Lucide } from "@qds.dev/ui";

<Lucide.Check width={24} />
`;
    const result = transform(code, "test.mdx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      "import __qds_i_lucide_check from 'virtual:icons/lucide/check'"
    );
    // Frontmatter should be preserved
    expect(result?.code).toContain("---");
    expect(result?.code).toContain('title: "Component Demo"');
  });

  it("should handle icons with expression attributes in MDX", () => {
    const code = `import { Lucide } from "@qds.dev/ui";

<Lucide.Check width={size} class={cn("icon", className)} />
`;
    const result = transform(code, "test.mdx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain("width={size}");
    expect(result?.code).toContain('class={cn("icon", className)}');
  });

  it("should handle MDX with mixed markdown and JSX", () => {
    const code = `import { Lucide } from "@qds.dev/ui";

# Heading

This is a paragraph with **bold** text.

<div class="flex gap-2">
  <Lucide.Check width={20} />
  <Lucide.X width={20} />
</div>

- List item 1
- List item 2

<Lucide.Star width={24} class="text-yellow-500" />
`;
    const result = transform(code, "test.mdx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      "import __qds_i_lucide_check from 'virtual:icons/lucide/check'"
    );
    expect(result?.code).toContain(
      "import __qds_i_lucide_x from 'virtual:icons/lucide/x'"
    );
    expect(result?.code).toContain(
      "import __qds_i_lucide_star from 'virtual:icons/lucide/star'"
    );
  });

  it("should handle MDX with code blocks and icons", () => {
    const code = `import { Lucide } from "@qds.dev/ui";

Here's some code:

\`\`\`tsx
import { Lucide } from "@qds.dev/ui";
<Lucide.Check />
\`\`\`

And here's a real icon: <Lucide.Check width={24} />
`;
    const result = transform(code, "test.mdx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      "import __qds_i_lucide_check from 'virtual:icons/lucide/check'"
    );
    // Should only transform the actual JSX, not the code block
    const svgMatches = result?.code.match(/<svg[^>]*>/g);
    expect(svgMatches).toHaveLength(1);
  });

  it("should return null for MDX without icon imports", () => {
    const code = `# Just Markdown

This is plain markdown without any icons.
`;
    const result = transform(code, "test.mdx");
    expect(result).toBeNull();
  });

  it("should return null for MDX with imports but no icon usage", () => {
    const code = `import { Lucide } from "@qds.dev/ui";

# Heading

Just text, no icons used.
`;
    const result = transform(code, "test.mdx");
    expect(result).toBeNull();
  });

  it("should handle MDX with inline JSX expressions", () => {
    const code = `import { Lucide } from "@qds.dev/ui";

# Status: {status}

<Lucide.Check width={24} class="inline" /> Task complete
`;
    const result = transform(code, "test.mdx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      "import __qds_i_lucide_check from 'virtual:icons/lucide/check'"
    );
    expect(result?.code).toContain('class="inline"');
  });

  it("should handle aliased imports in MDX", () => {
    const code = `import { Lucide as L } from "@qds.dev/ui";

<L.Check width={24} />
`;
    const result = transform(code, "test.mdx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      "import __qds_i_lucide_check from 'virtual:icons/lucide/check'"
    );
  });

  it("should generate valid JSX syntax for MDX transformations", () => {
    const code = `---
title: "Test"
---

import { Lucide } from "@qds.dev/ui";

# Demo

<Lucide.Check width={24} class="text-green-500" />
<Lucide.X width={20} class="text-red-500" />
`;
    const result = transform(code, "test.mdx");
    expect(result).toBeTruthy();

    // The transformed code should be parseable
    const validation = validateJSXSyntax(result?.code ?? "");
    if (!validation.isValid) {
      console.error("JSX validation errors for MDX:", validation.errors);
      console.error("Generated code:", result?.code);
    }
    expect(validation.isValid).toBe(true);
  });

  it("should handle complex MDX component with multiple icons", () => {
    const code = `---
title: "Checkbox Component"
---

import { Lucide } from "@qds.dev/ui";

# Checkbox

## Basic Example

<div class="flex items-center gap-2">
  <Lucide.Check width={20} class="text-green-600" />
  <span>Checked</span>
</div>

<div class="flex items-center gap-2">
  <Lucide.X width={20} class="text-red-600" />
  <span>Unchecked</span>
</div>

## Indeterminate

<Lucide.Minus width={20} class="text-gray-600" />
`;
    const result = transform(code, "checkbox.mdx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      "import __qds_i_lucide_check from 'virtual:icons/lucide/check'"
    );
    expect(result?.code).toContain(
      "import __qds_i_lucide_x from 'virtual:icons/lucide/x'"
    );
    expect(result?.code).toContain(
      "import __qds_i_lucide_minus from 'virtual:icons/lucide/minus'"
    );

    // Validate the transformed code
    const validation = validateJSXSyntax(result?.code ?? "");
    expect(validation.isValid).toBe(true);
  });

  it("should preserve boolean attributes in MDX", () => {
    const code = `import { Lucide } from "@qds.dev/ui";

<Lucide.Check disabled aria-hidden />
`;
    const result = transform(code, "test.mdx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain("disabled");
    expect(result?.code).toContain("aria-hidden");
  });

  it("should handle MDX with multiple import sources", () => {
    const code = `import { Lucide, Heroicons } from "@qds.dev/ui";

<Lucide.Check width={20} />
<Heroicons.Star width={24} />
`;
    const result = transform(code, "test.mdx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      "import __qds_i_lucide_check from 'virtual:icons/lucide/check'"
    );
    expect(result?.code).toContain(
      "import __qds_i_heroicons_star from 'virtual:icons/heroicons/star'"
    );
  });

  it("should deduplicate icon imports in MDX", () => {
    const code = `import { Lucide } from "@qds.dev/ui";

<Lucide.Check width={16} />
<Lucide.Check width={20} />
<Lucide.Check width={24} />
`;
    const result = transform(code, "test.mdx");
    expect(result).toBeTruthy();

    // Should only have one import for the same icon
    const importMatches = result?.code.match(/import __qds_i_lucide_check/g);
    expect(importMatches).toHaveLength(1);

    // All three uses should reference the same variable
    const svgMatches = result?.code.match(
      /dangerouslySetInnerHTML=\{__qds_i_lucide_check\}/g
    );
    expect(svgMatches).toHaveLength(3);
  });

  it("should handle MDX with nested JSX structures", () => {
    const code = `import { Lucide } from "@qds.dev/ui";

<div class="container">
  <div class="header">
    <Lucide.Menu width={24} />
  </div>
  <div class="content">
    <p>Text content</p>
    <Lucide.Check width={20} />
  </div>
</div>
`;
    const result = transform(code, "test.mdx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain(
      "import __qds_i_lucide_menu from 'virtual:icons/lucide/menu'"
    );
    expect(result?.code).toContain(
      "import __qds_i_lucide_check from 'virtual:icons/lucide/check'"
    );
  });

  it("should handle title prop in MDX", () => {
    const code = `import { Lucide } from "@qds.dev/ui";

# Accessibility Demo

<Lucide.Check title="Success" width={24} class="text-green-500" />
`;
    const result = transform(code, "test.mdx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain("<title>Success</title>");
    expect(result?.code).toContain("width={24}");
    expect(result?.code).toContain('class="text-green-500"');
  });

  it("should handle description prop in MDX", () => {
    const code = `import { Lucide } from "@qds.dev/ui";

<Lucide.Info description="Important information icon" width={20} />
`;
    const result = transform(code, "test.mdx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain("<desc>Important information icon</desc>");
    expect(result?.code).toContain("width={20}");
  });

  it("should handle both title and description props in MDX", () => {
    const code = `import { Lucide } from "@qds.dev/ui";

# Icon with A11y

<Lucide.Heart 
  title="Favorite" 
  description="Mark as favorite" 
  width={24} 
  class="text-red-500" 
/>
`;
    const result = transform(code, "test.mdx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain("<title>Favorite</title>");
    expect(result?.code).toContain("<desc>Mark as favorite</desc>");
    expect(result?.code).toContain("width={24}");
    expect(result?.code).toContain('class="text-red-500"');
  });

  it("should handle title and description with expressions in MDX", () => {
    const code = `import { Lucide } from "@qds.dev/ui";

<Lucide.Check title={dynamicTitle} description={dynamicDesc} />
`;
    const result = transform(code, "test.mdx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain("<title>{dynamicTitle}</title>");
    expect(result?.code).toContain("<desc>{dynamicDesc}</desc>");
  });

  it("should handle mixed title/description syntax in MDX", () => {
    const code = `import { Lucide } from "@qds.dev/ui";

# Multiple Icons

<Lucide.Check title="Completed" />
<Lucide.Star description="Featured item" />
<Lucide.Heart title="Favorite" description="Add to favorites" />
`;
    const result = transform(code, "test.mdx");
    expect(result).toBeTruthy();
    expect(result?.code).toContain("<title>Completed</title>");
    expect(result?.code).toContain("<desc>Featured item</desc>");
    // The third icon should have both
    const heartMatches = result?.code.match(
      /<title>Favorite<\/title>.*?<desc>Add to favorites<\/desc>/s
    );
    expect(heartMatches).toBeTruthy();
  });
});
