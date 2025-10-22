import { describe, expect, it } from "vitest";
import { qdsTransformPlugin } from "./qds-transform";

describe("qds transform plugin", () => {
  it("should wrap cleanup callback with $()", () => {
    const plugin = qdsTransformPlugin();

    const code = `import { useMountTask$ } from "@qds.dev/utils";

export const Component = component$(() => {
  useMountTask$(({ cleanup }) => {
    cleanup(() => {
      console.log("test");
    });
  });
});`;

    const id = "test-file.tsx";
    const result = plugin.transform(code, id);

    expect(result).not.toBeNull();
    expect(result?.code).toContain("cleanup($(() => {");
    expect(result?.code).toContain("}))");
  });

  it("should handle the checkbox error component", () => {
    const plugin = qdsTransformPlugin();

    const code = `import {
  $,
  type PropsOf,
  Slot,
  component$,
  useContext,
  useSignal,
} from "@qwik.dev/core";
import { Render } from "../render/render";
import { checkboxContextId } from "./checkbox-context";
import { appendId, removeId, useManagedAriaId, useMountTask$ } from "@qds.dev/utils";

type PublicCheckboxErrorProps = PropsOf<"div">;

export const CheckboxError = component$((props: PublicCheckboxErrorProps) => {
  const context = useContext(checkboxContextId);
  const errorId = \`\${context.localId}-error\`;
  const errorRef = useSignal<HTMLDivElement>();

  useMountTask$(({ cleanup }) => {
    context.describedByIds.value = appendId(context.describedByIds.value, errorId);
    
    cleanup(() => {
      console.log("removing id", errorId);
      context.describedByIds.value = removeId(context.describedByIds.value, errorId);
    });
  }, errorRef);

  return (
    <Render internalRef={errorRef} fallback="div" id={errorId} data-qds-checkbox-error {...props}>
      <Slot />
    </Render>
  );
});`;

    const id = "checkbox-error.tsx";
    const result = plugin.transform(code, id);

    expect(result).not.toBeNull();
    expect(result?.code).toContain("cleanup($(");
  });

  it("should not transform already wrapped cleanup callbacks", () => {
    const plugin = qdsTransformPlugin();

    const code = `import { useMountTask$ } from "@qds.dev/utils";

export const Component = component$(() => {
  useMountTask$(({ cleanup }) => {
    cleanup($(() => {
      console.log("already wrapped");
    }));
  });
});`;

    const id = "test-file.tsx";
    const result = plugin.transform(code, id);

    expect(result).toBeNull();
  });

  it("should handle multiple cleanup calls", () => {
    const plugin = qdsTransformPlugin();

    const code = `import { useMountTask$ } from "@qds.dev/utils";

export const Component = component$(() => {
  useMountTask$(({ cleanup }) => {
    cleanup(() => {
      console.log("first cleanup");
    });
    
    cleanup(() => {
      console.log("second cleanup");
    });
  });
});`;

    const id = "test-file.tsx";
    const result = plugin.transform(code, id);

    expect(result).not.toBeNull();

    const matches = result?.code.match(/cleanup\(\$\(/g);
    expect(matches?.length).toBe(2);
  });

  it("should work with arrow functions without braces", () => {
    const plugin = qdsTransformPlugin();

    const code = `import { useMountTask$ } from "@qds.dev/utils";

export const Component = component$(() => {
  useMountTask$(({ cleanup }) => {
    cleanup(() => doSomething());
  });
});`;

    const id = "test-file.tsx";
    const result = plugin.transform(code, id);

    expect(result).not.toBeNull();
    expect(result?.code).toContain("cleanup($(");
  });

  it("should work with function expressions", () => {
    const plugin = qdsTransformPlugin();

    const code = `import { useMountTask$ } from "@qds.dev/utils";

export const Component = component$(() => {
  useMountTask$(({ cleanup }) => {
    cleanup(function() {
      console.log("test");
    });
  });
});`;

    const id = "test-file.tsx";
    const result = plugin.transform(code, id);

    expect(result).not.toBeNull();
    expect(result?.code).toContain("cleanup($(function");
  });

  it("should skip files without useMountTask$", () => {
    const plugin = qdsTransformPlugin();

    const code = `export const Component = component$(() => {
  return <div>Hello</div>;
});`;

    const id = "test-file.tsx";
    const result = plugin.transform(code, id);

    expect(result).toBeNull();
  });

  it("should skip files without cleanup", () => {
    const plugin = qdsTransformPlugin();

    const code = `import { useMountTask$ } from "@qds.dev/utils";

export const Component = component$(() => {
  useMountTask$(() => {
    console.log("mount");
  });
});`;

    const id = "test-file.tsx";
    const result = plugin.transform(code, id);

    expect(result).toBeNull();
  });

  it("should auto-inject $ import when not present", () => {
    const plugin = qdsTransformPlugin();

    const code = `import { type PropsOf, Slot, component$, useContext, useSignal } from "@qwik.dev/core";
import { useMountTask$ } from "@qds.dev/utils";

export const Component = component$(() => {
  useMountTask$(({ cleanup }) => {
    cleanup(() => {
      console.log("cleanup");
    });
  });
});`;

    const id = "test-file.tsx";
    const result = plugin.transform(code, id);

    expect(result).not.toBeNull();
    expect(result?.code).toContain("import { $, type PropsOf");
    expect(result?.code).toContain("cleanup($(");
  });

  it("should not duplicate $ import if already present", () => {
    const plugin = qdsTransformPlugin();

    const code = `import { $, type PropsOf, Slot, component$, useContext, useSignal } from "@qwik.dev/core";
import { useMountTask$ } from "@qds.dev/utils";

export const Component = component$(() => {
  useMountTask$(({ cleanup }) => {
    cleanup(() => {
      console.log("cleanup");
    });
  });
});`;

    const id = "test-file.tsx";
    const result = plugin.transform(code, id);

    expect(result).not.toBeNull();
    // Should only have one $ at the start of the import, check it's not duplicated
    expect(result?.code).toContain("import { $,");
    expect(result?.code).not.toContain("import { $, $,");
    expect(result?.code).toContain("cleanup($(");
  });

  it("should inject $ import in checkbox description component", () => {
    const plugin = qdsTransformPlugin();

    const code = `import { type PropsOf, Slot, component$, useConstant, useContext, useSignal, useTask$ } from "@qwik.dev/core";
import { Render } from "../render/render";
import { checkboxContextId } from "./checkbox-context";
import { useManagedAriaId, useMountTask$ } from "@qds.dev/utils";

type PublicCheckboxDescriptionProps = PropsOf<"div">;

export const CheckboxDescription = component$((props: PublicCheckboxDescriptionProps) => {
  const context = useContext(checkboxContextId);
  const descriptionId = \`\${context.localId}-description\`;
  const descriptionRef = useSignal<HTMLDivElement>();
  
  useMountTask$(({ cleanup }) => {
    cleanup(() => {
      console.log("cleanup");
    });
  }, descriptionRef);

  return (
    <Render fallback="div" id={descriptionId} data-qds-checkbox-description {...props} internalRef={descriptionRef}>
      <Slot />
    </Render>
  );
});`;

    const id = "checkbox-description.tsx";
    const result = plugin.transform(code, id);

    expect(result).not.toBeNull();
    expect(result?.code).toContain("import { $, type PropsOf");
    expect(result?.code).toContain("cleanup($(");
  });
});
