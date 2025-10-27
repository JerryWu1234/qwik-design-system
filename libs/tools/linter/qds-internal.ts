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
    const defaultPattern = /^default[A-Z][a-zA-Z0-9]*$/;

    function reportViolation(node: Ranged, name: string) {
      context.report({
        node,
        messageId: "defaultXPattern",
        data: { name }
      });
    }

    function checkPropertyName(node: ESTree.IdentifierName, name: string) {
      if (!name || !defaultPattern.test(name)) {
        return;
      }

      reportViolation(node, name);
    }

    return {
      TSPropertySignature(node: Node) {
        const tsNode = node as unknown as ESTree.TSPropertySignature;
        if (tsNode.key.type === "Identifier" && tsNode.key.name) {
          checkPropertyName(tsNode.key, tsNode.key.name);
        }
      }
    };
  }
});

const qdsPlugin = definePlugin({
  meta: {
    name: "qds"
  },
  rules: {
    "no-default-name": noDefaultXNamingRule
  }
});

export default qdsPlugin;
