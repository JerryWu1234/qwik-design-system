/**
 * Oxlint plugin for Qwik Design System
 *
 * Custom linting rules specific to Qwik patterns and conventions
 */

import {
  type Context,
  definePlugin,
  defineRule,
  type ESTree,
  type Node,
  type Ranged
} from "oxlint";

/**
 * Rule: no-default-x-naming
 *
 * Prevents React-style "defaultX" naming pattern in favor of Qwik's
 * signal-based and value-based state patterns.
 *
 * Only checks TypeScript interface/type properties that could be component props.
 * Does not check internal implementation details, variables, or function parameters.
 *
 * ❌ Bad: interface Props { defaultValue?: string }
 * ✅ Good: interface Props { value?: Signal<string> }
 */
const noDefaultXNamingRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow 'defaultX' naming pattern in component props - use Qwik's signal/value-based patterns instead",
      category: "Best Practices",
      recommended: true,
      url: "https://qwik.design/contributing/state/"
    },
    messages: {
      defaultXPattern:
        "'{{name}}' uses React's defaultX pattern. Qwik uses signal-based (two-way binding) or value-based (one-way binding) patterns instead. See: https://qwik.design/contributing/state/"
    },
    schema: []
  },

  createOnce(context: Context) {
    // Regex pattern: default followed by uppercase letter
    const pattern = /^default[A-Z][a-zA-Z0-9]*$/;

    // Check if current file is a test/spec/mock file or non-component file
    let isTestFile: boolean;
    let isComponentFile: boolean;

    /**
     * Reports a defaultX pattern violation
     */
    function reportViolation(node: Ranged, name: string) {
      context.report({
        node,
        messageId: "defaultXPattern",
        data: { name }
      });
    }

    /**
     * Checks if an identifier matches the defaultX pattern
     */
    function checkPropertyName(node: ESTree.IdentifierName, name: string) {
      if (!name || !pattern.test(name)) {
        return;
      }

      reportViolation(node, name);
    }

    return {
      before() {
        // Determine if this is a test file
        const filename = context.filename;
        if (!filename) {
          return false;
        }

        isTestFile =
          /\.(test|spec|mock)\.(tsx?|jsx?)$/.test(filename) ||
          filename.includes("__tests__") ||
          filename.includes("__mocks__");

        // Check if this is likely a component file (TSX/JSX)
        isComponentFile = /\.(tsx|jsx)$/.test(filename);

        // Skip test files and non-component files
        if (isTestFile || !isComponentFile) {
          return false;
        }
      },

      // Only check interface/type properties in TypeScript
      // These are likely to be component props
      TSPropertySignature(node: Node) {
        // The visitor guarantees this is a TSPropertySignature
        const tsNode = node as unknown as ESTree.TSPropertySignature;
        if (tsNode.key.type === "Identifier" && tsNode.key.name) {
          checkPropertyName(tsNode.key, tsNode.key.name);
        }
      }
    };
  }
});

/**
 * Plugin definition
 */
const qdsPlugin = definePlugin({
  meta: {
    name: "qds"
  },
  rules: {
    "no-default-name": noDefaultXNamingRule
  }
});

export default qdsPlugin;
