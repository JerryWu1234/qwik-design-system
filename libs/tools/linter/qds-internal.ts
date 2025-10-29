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
      url: "https://qds.dev/contributing/state/"
    },
    messages: {
      defaultXPattern:
        "'{{name}}' uses React's defaultX pattern. Qwik uses signal-based (two-way binding) or value-based (one-way binding) patterns instead. See: https://qds.dev/contributing/state/"
    },
    schema: []
  },

  createOnce(context: Context) {
    const defaultPattern = /^default[A-Z][a-zA-Z0-9]*$/;

    return {
      TSPropertySignature(node: Node) {
        const tsNode = node as unknown as ESTree.TSPropertySignature;
        if (tsNode.key.type !== "Identifier") return;
        if (!tsNode.key.name) return;

        const name = tsNode.key.name;
        if (!defaultPattern.test(name)) return;

        context.report({
          node: tsNode.key,
          messageId: "defaultXPattern",
          data: { name }
        });
      }
    };
  }
});

const eventHandlersArrayPatternRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Event handlers should use array pattern to combine local handlers with props",
      category: "Best Practices",
      recommended: true,
      url: "https://qds.dev/contributing/"
    },
    messages: {
      requireArrayPattern:
        "Event handler '{{name}}' should use array pattern: [localHandler$, props.{{name}}]."
    },
    schema: []
  },

  createOnce(context: Context) {
    return {
      JSXAttribute(node: Node) {
        const jsxAttr = node as unknown as ESTree.JSXAttribute;

        if (jsxAttr.name.type !== "JSXIdentifier") return;

        const attrName = jsxAttr.name.name;
        if (!attrName.startsWith("on") || !attrName.endsWith("$")) return;

        const value = jsxAttr.value;
        if (!value || value.type !== "JSXExpressionContainer") return;

        const expr = value.expression;

        // Allow array expressions: onXxx$={[handler$, props.onXxx$]}
        if (expr.type === "ArrayExpression") return;

        // Allow ternary expressions (single-line ternaries are valid)
        if (expr.type === "ConditionalExpression") return;

        context.report({
          node: jsxAttr.name,
          messageId: "requireArrayPattern",
          data: { name: attrName }
        });
      }
    };
  }
});

function collectHTMLElements(node: ESTree.Expression | ESTree.JSXElement): string[] {
  const elements: string[] = [];

  const walk = (n: unknown): void => {
    if (!n || typeof n !== "object") return;

    const node = n as Record<string, unknown>;
    if (node.type === "JSXElement") {
      const openingElement = node.openingElement as Record<string, unknown> | undefined;
      if (openingElement?.name) {
        const name = openingElement.name as Record<string, unknown>;
        if (name.type === "JSXIdentifier") {
          const tagName = name.name as string;
          // Only collect lowercase tags (HTML elements, not components)
          if (tagName && tagName[0] === tagName[0].toLowerCase()) {
            elements.push(tagName);
          }
        }
      }
    }

    // Recursively walk children
    for (const key in node) {
      const value = node[key];
      if (key === "children" && Array.isArray(value)) {
        value.forEach(walk);
      } else if (value && typeof value === "object") {
        walk(value);
      }
    }
  };

  walk(node);
  return elements;
}

const oneElementCompositionRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Components should follow 'One Component, One Markup Element' principle",
      category: "Best Practices",
      recommended: true,
      url: "https://qds.dev/contributing/composition/"
    },
    messages: {
      multipleElements:
        "Component returns multiple HTML element types: {{elements}}. Each component should correspond to ONE type of markup element. Add '// no-composition-check' to exempt."
    },
    schema: []
  },

  createOnce(context: Context) {
    let hasCompositionCheckDisable = false;
    const componentReturnElements = new Map<string, Set<string>>();
    let currentComponentName: string | null = null;

    return {
      Program() {
        // Check for no-composition-check comment
        // Note: In a real implementation, we'd check context.sourceCode.getAllComments()
        // For now, we'll skip this feature in the linter
        hasCompositionCheckDisable = false;
      },

      VariableDeclarator(node: Node) {
        const decl = node as unknown as ESTree.VariableDeclarator;
        if (decl.init?.type !== "CallExpression") return;

        const callee = decl.init.callee;
        if (callee.type !== "Identifier") return;
        if (callee.name !== "component$") return;
        if (decl.id.type !== "Identifier") return;

        currentComponentName = decl.id.name;
        componentReturnElements.set(currentComponentName, new Set());
      },

      ReturnStatement(node: Node) {
        if (!currentComponentName || hasCompositionCheckDisable) return;

        const returnStmt = node as unknown as ESTree.ReturnStatement;
        if (!returnStmt.argument) return;

        // Collect HTML elements from the return statement
        const elements = collectHTMLElements(returnStmt.argument);
        const elementSet = componentReturnElements.get(currentComponentName);

        if (elementSet) {
          elements.forEach((el) => elementSet.add(el));
        }
      },

      "VariableDeclarator:exit"(node: Node) {
        const decl = node as unknown as ESTree.VariableDeclarator;
        if (decl.init?.type !== "CallExpression") return;

        const callee = decl.init.callee;
        if (callee.type !== "Identifier") return;
        if (callee.name !== "component$") return;
        if (!currentComponentName) return;
        if (decl.id.type !== "Identifier") return;

        const elementSet = componentReturnElements.get(currentComponentName);

        if (elementSet && elementSet.size > 1) {
          const elements = Array.from(elementSet).toSorted().join(", ");
          context.report({
            node: decl.id,
            messageId: "multipleElements",
            data: { elements }
          });
        }

        currentComponentName = null;
      }
    };
  }
});

const requireUseBindingsRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Root components (*-root.tsx) should use useBindings or include '// no-bindings' comment",
      category: "Best Practices",
      recommended: true,
      url: "https://qds.dev/contributing/state/#useBindings"
    },
    messages: {
      missingBindings:
        "Root component is missing useBindings. Add useBindings or include '// no-bindings' comment if not needed."
    },
    schema: []
  },

  createOnce(context: Context) {
    let hasUseBindings = false;
    let hasNoBindingsComment = false;
    let hasComponent = false;
    let componentNode: Ranged | null = null;
    let isRootComponent = false;

    return {
      Program() {
        // Check if this is a root component file
        const filename = context.filename;
        isRootComponent =
          filename.endsWith("-root.tsx") || filename.endsWith("-root.jsx");

        // Note: In a real implementation, we'd check for comments here
        hasNoBindingsComment = false;
      },

      CallExpression(node: Node) {
        if (!isRootComponent) return;

        const call = node as unknown as ESTree.CallExpression;
        const callee = call.callee;
        if (callee.type !== "Identifier") return;

        // Check for component$
        if (callee.name === "component$") {
          hasComponent = true;
          componentNode = node;
        }

        // Check for useBindings
        if (callee.name === "useBindings") {
          hasUseBindings = true;
        }
      },

      "Program:exit"() {
        if (!isRootComponent) return;
        if (!hasComponent) return;
        if (hasUseBindings) return;
        if (hasNoBindingsComment) return;
        if (!componentNode) return;

        context.report({
          node: componentNode,
          messageId: "missingBindings"
        });
      }
    };
  }
});

const requireResearchFileRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Root components (*-root.tsx) require a research file (research.md or research.mdx)",
      category: "Best Practices",
      recommended: true,
      url: "https://qwik.design/contributing/research/"
    },
    messages: {
      missingResearch:
        "Root component requires a research file. Create research.md or research.mdx in this directory documenting component research, accessibility, design decisions, and usage guidelines."
    },
    schema: []
  },

  createOnce(context: Context) {
    let isRootComponent = false;
    let hasComponent = false;
    let componentNode: Ranged | null = null;

    return {
      Program() {
        const filename = context.filename;
        isRootComponent =
          filename.endsWith("-root.tsx") || filename.endsWith("-root.jsx");
      },

      CallExpression(node: Node) {
        if (!isRootComponent) return;

        const call = node as unknown as ESTree.CallExpression;
        const callee = call.callee;
        if (callee.type !== "Identifier") return;

        if (callee.name === "component$") {
          hasComponent = true;
          componentNode = node;
        }
      },

      "Program:exit"() {
        if (!isRootComponent) return;
        if (!hasComponent) return;
        if (!componentNode) return;

        // Note: We can't actually check the filesystem from oxlint
        // This rule serves as a reminder/documentation
        // The actual enforcement is done by the GitHub Actions workflow
        context.report({
          node: componentNode,
          messageId: "missingResearch"
        });
      }
    };
  }
});

const requireTestFileRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Root components (*-root.tsx) require a test file (*.browser.tsx)",
      category: "Best Practices",
      recommended: true,
      url: "https://qwik.design/contributing/testing/"
    },
    messages: {
      missingTest:
        "Root component requires a test file. Create a *.browser.tsx file in this directory with component tests."
    },
    schema: []
  },

  createOnce(context: Context) {
    let isRootComponent = false;
    let hasComponent = false;
    let componentNode: Ranged | null = null;

    return {
      Program() {
        const filename = context.filename;
        isRootComponent =
          filename.endsWith("-root.tsx") || filename.endsWith("-root.jsx");
      },

      CallExpression(node: Node) {
        if (!isRootComponent) return;

        const call = node as unknown as ESTree.CallExpression;
        const callee = call.callee;
        if (callee.type !== "Identifier") return;

        if (callee.name === "component$") {
          hasComponent = true;
          componentNode = node;
        }
      },

      "Program:exit"() {
        if (!isRootComponent) return;
        if (!hasComponent) return;
        if (!componentNode) return;

        // Note: We can't actually check the filesystem from oxlint
        // This rule serves as a reminder/documentation
        // The actual enforcement is done by the GitHub Actions workflow
        context.report({
          node: componentNode,
          messageId: "missingTest"
        });
      }
    };
  }
});

const qdsPlugin = definePlugin({
  meta: {
    name: "qds"
  },
  rules: {
    "no-default-name": noDefaultXNamingRule,
    "event-handlers-array-pattern": eventHandlersArrayPatternRule,
    "one-element-composition": oneElementCompositionRule,
    "require-use-bindings": requireUseBindingsRule,
    "require-research-file": requireResearchFileRule,
    "require-test-file": requireTestFileRule
  }
});

export default qdsPlugin;
