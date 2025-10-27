import { describe, it } from "vitest";
import qdsPlugin from "./qds-internal";
import { createRuleTester } from "./rule-tester";

const { valid, invalid } = createRuleTester({
  name: "qds/no-default-name",
  rule: qdsPlugin.rules["no-default-name"]
});

describe("qds/no-default-name", () => {
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
