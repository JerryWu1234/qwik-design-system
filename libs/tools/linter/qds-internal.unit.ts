import { describe, it } from "vitest";
import qdsPlugin from "./qds-internal";
import { createRuleTester } from "./rule-tester";

describe("qds/no-default-name", () => {
  const { valid, invalid } = createRuleTester({
    name: "qds/no-default-name",
    rule: qdsPlugin.rules["no-default-name"]
  });

  it("allows value-based props", () => {
    valid("interface Props { value?: string; checked?: boolean; }");
  });

  it("allows QRL props", () => {
    valid("interface Props { onChange$?: QRL<() => void>; }");
  });

  it("flags defaultValue pattern", () => {
    invalid("interface Props { defaultValue?: string; }");
  });

  it("flags multiple default patterns", () => {
    invalid({
      code: "interface Props { defaultChecked?: boolean; defaultOpen?: boolean; }",
      errors: ["defaultChecked", "defaultOpen"]
    });
  });

  it("flags default pattern in type alias", () => {
    invalid({
      code: "type Props = { defaultPressed?: boolean; };",
      errors: ["defaultPressed"]
    });
  });

  it("flags default pattern in .ts files", () => {
    invalid({
      code: "interface Props { defaultValue?: string; }",
      filename: "utils.ts",
      errors: ["defaultValue"]
    });
  });
});

describe("qds/event-handlers-array-pattern", () => {
  const { valid, invalid } = createRuleTester({
    name: "qds/event-handlers-array-pattern",
    rule: qdsPlugin.rules["event-handlers-array-pattern"]
  });

  it("allows array pattern", () => {
    valid("<button onClick$={[handleClick$, props.onClick$]} />");
  });

  it("allows ternary expressions", () => {
    valid("<button onClick$={isDisabled ? undefined : handleClick$} />");
  });

  it("flags non-array event handler", () => {
    invalid({
      code: "<button onClick$={handleClick$} />",
      errors: ["onClick$"]
    });
  });

  it("flags multiple non-array handlers", () => {
    invalid({
      code: "<input onKeyDown$={handleKeyDown$} onChange$={handleChange$} />",
      errors: ["onKeyDown$", "onChange$"]
    });
  });

  it("allows events without $ suffix", () => {
    valid("<button onClick={handleClick} />");
  });
});

describe("qds/one-element-composition", () => {
  const { valid, invalid } = createRuleTester({
    name: "qds/one-element-composition",
    rule: qdsPlugin.rules["one-element-composition"]
  });

  it("allows single element type", () => {
    valid(`
      const Button = component$(() => {
        return <button>Click</button>;
      });
    `);
  });

  it("allows components with custom components", () => {
    valid(`
      const Wrapper = component$(() => {
        return <div><CustomComponent /><AnotherComponent /></div>;
      });
    `);
  });

  it("flags multiple HTML element types", () => {
    invalid({
      code: `
        const BadComponent = component$(() => {
          return <div><span>Text</span></div>;
        });
      `,
      errors: ["div, span"]
    });
  });

  it("flags multiple different elements", () => {
    invalid({
      code: `
        const Complex = component$(() => {
          return (
            <section>
              <div>Content</div>
              <p>More</p>
            </section>
          );
        });
      `,
      errors: 1
    });
  });

  it("allows single element with nested same type", () => {
    valid(`
      const List = component$(() => {
        return <div><div>Nested</div></div>;
      });
    `);
  });
});

describe("qds/require-use-bindings", () => {
  const { valid, invalid } = createRuleTester({
    name: "qds/require-use-bindings",
    rule: qdsPlugin.rules["require-use-bindings"],
    filename: "button-root.tsx"
  });

  it("allows root component with useBindings", () => {
    valid({
      code: `
        const Button = component$(() => {
          const { valueSig } = useBindings(props, { value: "" });
          return <button />;
        });
      `,
      filename: "button-root.tsx"
    });
  });

  it("flags root component without useBindings", () => {
    invalid({
      code: `
        const Button = component$(() => {
          return <button />;
        });
      `,
      filename: "checkbox-root.tsx",
      errors: 1
    });
  });

  it("allows non-root component without useBindings", () => {
    valid({
      code: `
        const Helper = component$(() => {
          return <span />;
        });
      `,
      filename: "helper.tsx"
    });
  });
});

describe("qds/require-research-file", () => {
  const { valid, invalid } = createRuleTester({
    name: "qds/require-research-file",
    rule: qdsPlugin.rules["require-research-file"],
    filename: "button-root.tsx"
  });

  it("flags root component (note: actual file check is in CI)", () => {
    // Note: This rule can't actually check the filesystem from oxlint
    // It serves as documentation/reminder, enforced by GitHub Actions
    // Users can disable it per-file once they've added the research file
    invalid({
      code: `
        const Button = component$(() => {
          return <button />;
        });
      `,
      filename: "checkbox-root.tsx",
      errors: 1
    });
  });

  it("allows non-root component", () => {
    valid({
      code: `
        const Helper = component$(() => {
          return <span />;
        });
      `,
      filename: "helper.tsx"
    });
  });
});

describe("qds/require-test-file", () => {
  const { valid, invalid } = createRuleTester({
    name: "qds/require-test-file",
    rule: qdsPlugin.rules["require-test-file"],
    filename: "button-root.tsx"
  });

  it("flags root component (note: actual file check is in CI)", () => {
    // Note: This rule can't actually check the filesystem from oxlint
    // It serves as documentation/reminder, enforced by GitHub Actions
    // Users can disable it per-file once they've added the test file
    invalid({
      code: `
        const Button = component$(() => {
          return <button />;
        });
      `,
      filename: "checkbox-root.tsx",
      errors: 1
    });
  });

  it("allows non-root component", () => {
    valid({
      code: `
        const Helper = component$(() => {
          return <span />;
        });
      `,
      filename: "helper.tsx"
    });
  });
});
