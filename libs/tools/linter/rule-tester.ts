/**
 * RuleTester for oxlint rules
 *
 * Provides a clean API similar to ESLint's RuleTester but designed for oxc/oxlint.
 * Works seamlessly with Vitest for testing custom lint rules.
 */
import type { Node as WalkerNode } from "@oxc-project/types";
import { parseSync } from "oxc-parser";
import { walk } from "oxc-walker";
import type { Context, Node, Ranged, Rule, VisitorWithHooks } from "oxlint";
import { describe, expect, it } from "vitest";

export interface ValidTestCase {
  /** The code that should not trigger any errors */
  code: string;
  /** Optional filename (defaults to test.tsx) */
  filename?: string;
  /** Optional description for the test case */
  description?: string;
}

export interface InvalidTestCase {
  /** The code that should trigger errors */
  code: string;
  /** Expected error messages or count */
  errors:
    | number // Just the count of errors
    | string[] // Array of strings that should appear in error messages
    | Array<
        | string // Just the message
        | { message: string; line?: number; column?: number } // Message with optional position
        | { messageId: string; data?: Record<string, string> } // MessageId with data
      >;
  /** Optional filename (defaults to test.tsx) */
  filename?: string;
  /** Optional description for the test case */
  description?: string;
}

export interface RuleTesterConfig {
  /** Default filename for test cases */
  filename?: string;
}

interface ReportedError {
  node: Ranged;
  messageId?: string;
  message?: string;
  data?: Record<string, string>;
}

/**
 * RuleTester - Test utility for oxlint rules
 *
 * @example
 * ```ts
 * import { RuleTester } from './rule-tester';
 * import myRule from './my-rule';
 *
 * const ruleTester = new RuleTester();
 *
 * ruleTester.run('my-rule', myRule, {
 *   valid: [
 *     'const x = 1;',
 *     { code: 'const y = 2;', filename: 'test.ts' }
 *   ],
 *   invalid: [
 *     {
 *       code: 'var x = 1;',
 *       errors: ['Use const instead of var']
 *     }
 *   ]
 * });
 * ```
 */
export class RuleTester {
  private config: RuleTesterConfig;

  constructor(config: RuleTesterConfig = {}) {
    this.config = {
      filename: "test.tsx",
      ...config
    };
  }

  run(
    ruleName: string,
    rule: Rule,
    tests: {
      valid?: Array<string | ValidTestCase>;
      invalid?: Array<string | InvalidTestCase>;
    }
  ) {
    describe(ruleName, () => {
      const valid = tests.valid || [];
      const invalid = tests.invalid || [];

      if (valid.length > 0) {
        describe("valid", () => {
          for (const testCase of valid) {
            const normalized = this.normalizeValidTestCase(testCase);
            const title = normalized.description || normalized.code.trim().slice(0, 50);

            it(title, () => {
              const errors = this.runRule(rule, normalized.code, normalized.filename);
              expect(errors).toHaveLength(0);
            });
          }
        });
      }

      if (invalid.length > 0) {
        describe("invalid", () => {
          for (const testCase of invalid) {
            const normalized: InvalidTestCase =
              typeof testCase === "string" ? { code: testCase, errors: 1 } : testCase;

            const title = normalized.description || normalized.code.trim().slice(0, 50);

            it(title, () => {
              const errors = this.runRule(rule, normalized.code, normalized.filename);

              expect(errors.length).toBeGreaterThan(0);

              if (typeof normalized.errors === "number") {
                expect(errors).toHaveLength(normalized.errors);
                return;
              }

              // If errors is a string array, check each string appears in error messages
              if (
                Array.isArray(normalized.errors) &&
                normalized.errors.every((e) => typeof e === "string")
              ) {
                this.validateStringArrayErrors(errors, normalized.errors as string[]);
                return;
              }

              expect(errors).toHaveLength(normalized.errors.length);

              for (let i = 0; i < normalized.errors.length; i++) {
                const expectedError = normalized.errors[i];
                const actualError = errors[i];

                if (typeof expectedError === "string") {
                  const actualMessage = this.formatErrorMessage(actualError);
                  expect(actualMessage).toContain(expectedError);
                } else if ("message" in expectedError) {
                  const actualMessage = this.formatErrorMessage(actualError);
                  expect(actualMessage).toContain(expectedError.message);
                } else if ("messageId" in expectedError) {
                  expect(actualError.messageId).toBe(expectedError.messageId);

                  if (expectedError.data) {
                    expect(actualError.data).toMatchObject(expectedError.data);
                  }
                }
              }
            });
          }
        });
      }
    });
  }

  private runRule(rule: Rule, code: string, filename?: string): ReportedError[] {
    const errors: ReportedError[] = [];
    const actualFilename = filename || this.config.filename!;

    const ext = actualFilename.split(".").pop() || "tsx";
    const lang = (["js", "jsx", "ts", "tsx", "dts"].includes(ext) ? ext : "tsx") as
      | "js"
      | "jsx"
      | "ts"
      | "tsx"
      | "dts";

    const parseResult = parseSync(actualFilename, code, { lang });

    if (parseResult.errors.length > 0) {
      throw new Error(
        `Parse error in test code:\n${parseResult.errors.map((e) => e.message).join("\n")}`
      );
    }

    const context: Context = this.createMockContext(code, actualFilename, errors);

    const ruleInstance: VisitorWithHooks =
      "createOnce" in rule ? rule.createOnce(context) : rule.create(context);

    if (ruleInstance.before) {
      const result = ruleInstance.before();
      if (result === false) {
        return errors;
      }
    }

    walk(parseResult.program, {
      enter: (node: WalkerNode) => {
        const visitor = ruleInstance[node.type as keyof VisitorWithHooks];
        if (typeof visitor === "function") {
          (visitor as (node: Node) => void)(node as unknown as Node);
        }
      },
      leave: (node: WalkerNode) => {
        const exitKey = `${node.type}:exit` as keyof VisitorWithHooks;
        const exitVisitor = ruleInstance[exitKey];
        if (typeof exitVisitor === "function") {
          (exitVisitor as (node: Node) => void)(node as unknown as Node);
        }
      }
    });

    if (ruleInstance.after) {
      ruleInstance.after();
    }

    return errors;
  }

  private createMockContext(
    code: string,
    filename: string,
    errors: ReportedError[]
  ): Context {
    return {
      filename,
      report(descriptor: {
        node: Ranged;
        messageId?: string;
        message?: string;
        data?: Record<string, string>;
      }) {
        errors.push({
          node: descriptor.node,
          messageId: descriptor.messageId,
          message: descriptor.message,
          data: descriptor.data
        });
      }
    } as Context;
  }

  private normalizeValidTestCase(testCase: string | ValidTestCase): ValidTestCase {
    if (typeof testCase === "string") {
      return { code: testCase };
    }
    return testCase;
  }

  private formatErrorMessage(error: ReportedError): string {
    if (error.message) {
      return error.message;
    }

    // Include both messageId and data values for matching
    const parts: string[] = [error.messageId || ""];

    if (error.data) {
      parts.push(...Object.values(error.data));
    }

    return parts.join(" ");
  }

  private validateStringArrayErrors(errors: ReportedError[], expected: string[]): void {
    expect(errors).toHaveLength(expected.length);
    for (let i = 0; i < expected.length; i++) {
      const expectedFragment = expected[i];
      const actualMessage = this.formatErrorMessage(errors[i]);
      expect(actualMessage).toContain(expectedFragment);
    }
  }
}

/**
 * Creates explicit test helpers for better DX
 * Inspired by eslint-vitest-rule-tester but with our intuitive error format
 */
export function createRuleTester(options: {
  name: string;
  rule: Rule;
  filename?: string;
}) {
  const tester = new RuleTester({
    filename: options.filename || "test.tsx"
  });

  /**
   * Test a valid code case
   */
  function valid(code: string | ValidTestCase) {
    const normalized = typeof code === "string" ? { code } : code;
    const errors = tester["runRule"](options.rule, normalized.code, normalized.filename);
    expect(errors).toHaveLength(0);
  }

  /**
   * Test an invalid code case
   * Returns errors for further assertions (e.g., snapshots)
   */
  function invalid(
    testCase:
      | string
      | {
          code: string;
          errors:
            | number
            | string[]
            | Array<
                | string
                | { message: string; line?: number; column?: number }
                | { messageId: string; data?: Record<string, string> }
              >;
          filename?: string;
          output?: string;
        }
  ) {
    const normalized: InvalidTestCase =
      typeof testCase === "string" ? { code: testCase, errors: 1 } : testCase;

    const errors = tester["runRule"](options.rule, normalized.code, normalized.filename);

    expect(errors.length).toBeGreaterThan(0);

    // If errors is just a number, only check the count
    if (typeof normalized.errors === "number") {
      expect(errors).toHaveLength(normalized.errors);
      return { errors };
    }

    // If errors is a string array, check each string appears in error messages
    if (
      Array.isArray(normalized.errors) &&
      normalized.errors.every((e) => typeof e === "string")
    ) {
      tester["validateStringArrayErrors"](errors, normalized.errors as string[]);
      return { errors };
    }

    expect(errors).toHaveLength(normalized.errors.length);

    for (let i = 0; i < normalized.errors.length; i++) {
      const expectedError = normalized.errors[i];
      const actualError = errors[i];

      if (typeof expectedError === "string") {
        const actualMessage = tester["formatErrorMessage"](actualError);
        expect(actualMessage).toContain(expectedError);
      } else if ("message" in expectedError) {
        const actualMessage = tester["formatErrorMessage"](actualError);
        expect(actualMessage).toContain(expectedError.message);
      } else if ("messageId" in expectedError) {
        expect(actualError.messageId).toBe(expectedError.messageId);

        if (expectedError.data) {
          expect(actualError.data).toMatchObject(expectedError.data);
        }
      }
    }

    return { errors };
  }

  return { valid, invalid };
}
