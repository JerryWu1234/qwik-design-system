import type { Node } from "@oxc-project/types";
import { parseSync } from "oxc-parser";
import { describe, expect, it } from "vitest";
import { detectsRenderComponentUsage, returnsRenderComponent } from "./transform-dts";

describe("transform-dts", () => {
  describe("detectsRenderComponentUsage", () => {
    it("should detect component$ with generic type returning Render (Label pattern)", () => {
      const code = `import { $, type PropsOf, Slot, component$, sync$ } from "@qwik.dev/core";
import { Render } from "../render/render";

type LabelProps = PropsOf<"label">;

export const Label = component$<LabelProps>((props) => {
  const handleMouseDownSync$ = sync$((event: MouseEvent) => {
    if (!event.defaultPrevented && event.detail > 1) {
      event.preventDefault();
    }
  });

  return (
    <Render
      fallback="label"
      {...props}
      onMouseDown$={[handleMouseDownSync$, props.onMouseDown$]}
    >
      <Slot />
    </Render>
  );
});`;

      expect(detectsRenderComponentUsage(code)).toBe(true);
    });

    it("should detect component$ with inline type returning Render (ModalTrigger pattern)", () => {
      const code = `import { $, type PropsOf, Slot, component$, useContext } from "@qwik.dev/core";
import { Render } from "../render/render";
import { modalContextId } from "./modal-root";

export const ModalTrigger = component$((props: PropsOf<"button">) => {
  const context = useContext(modalContextId);

  const handleToggle$ = $(() => {
    context.isOpen.value = !context.isOpen.value;
  });

  return (
    <Render
      {...props}
      fallback="button"
      aria-haspopup="dialog"
      onClick$={[handleToggle$, props.onClick$]}
    >
      <Slot />
    </Render>
  );
});`;

      expect(detectsRenderComponentUsage(code)).toBe(true);
    });

    it("should detect component$ with type alias returning Render (CheckboxDescription pattern)", () => {
      const code = `import { type PropsOf, Slot, component$, useContext, useSignal } from "@qwik.dev/core";
import { Render } from "../render/render";
import { checkboxContextId } from "./checkbox-context";

type PublicCheckboxDescriptionProps = PropsOf<"div">;

export const CheckboxDescription = component$((props: PublicCheckboxDescriptionProps) => {
  const context = useContext(checkboxContextId);
  const descriptionId = \`\${context.localId}-description\`;
  const descriptionRef = useSignal<HTMLDivElement>();

  return (
    <Render
      fallback="div"
      id={descriptionId}
      data-qds-checkbox-description
      {...props}
      internalRef={descriptionRef}
    >
      <Slot />
    </Render>
  );
});`;

      expect(detectsRenderComponentUsage(code)).toBe(true);
    });

    it("should detect arrow function with implicit return of Render", () => {
      const code = `import { type PropsOf, Slot, component$ } from "@qwik.dev/core";
import { Render } from "../render/render";

export const Button = component$<PropsOf<"button">>((props) => (
  <Render fallback="button" {...props}>
    <Slot />
  </Render>
));`;

      expect(detectsRenderComponentUsage(code)).toBe(true);
    });

    it("should not detect component$ not returning Render component", () => {
      const code = `import { type PropsOf, Slot, component$ } from "@qwik.dev/core";

type PublicButtonProps = PropsOf<"button">;

export const Button = component$((props: PublicButtonProps) => {
  return (
    <button {...props}>
      <Slot />
    </button>
  );
});`;

      expect(detectsRenderComponentUsage(code)).toBe(false);
    });

    it("should not detect files without component$", () => {
      const code = `import { createContextId } from "@qwik.dev/core";

export interface CheckboxContext {
  localId: string;
  isChecked: boolean;
}

export const checkboxContextId = createContextId<CheckboxContext>("checkbox");`;

      expect(detectsRenderComponentUsage(code)).toBe(false);
    });

    it("should handle invalid/unparseable code gracefully", () => {
      const code = `this is not valid typescript code {{{ `;

      expect(detectsRenderComponentUsage(code)).toBe(false);
    });

    it("should handle multiple components where only one returns Render", () => {
      const code = `import { type PropsOf, Slot, component$ } from "@qwik.dev/core";
import { Render } from "../render/render";

export const RegularButton = component$((props: PropsOf<"button">) => {
  return <button {...props}><Slot /></button>;
});

export const RenderButton = component$((props: PropsOf<"button">) => {
  return <Render fallback="button" {...props}><Slot /></Render>;
});`;

      expect(detectsRenderComponentUsage(code)).toBe(true);
    });

    it("should handle ModalClose with complex props type", () => {
      const code = `import { $, type PropsOf, Slot, component$, useContext } from "@qwik.dev/core";
import { Render } from "../render/render";
import { modalContextId } from "./modal-root";

export const ModalClose = component$((props: PropsOf<"button"> & { customProp?: string }) => {
  const context = useContext(modalContextId);

  const handleClick$ = $(() => {
    context.isOpen.value = false;
  });

  return (
    <Render
      type="button"
      fallback="button"
      onClick$={[handleClick$, props.onClick$]}
      {...props}
    >
      <Slot />
    </Render>
  );
});`;

      expect(detectsRenderComponentUsage(code)).toBe(true);
    });

    it("should handle component using another component's type", () => {
      const code = `import { type PropsOf, Slot, component$ } from "@qwik.dev/core";
import { Render } from "../render/render";
import type { CollapsibleRoot } from "./collapsible-root";

type CustomProps = PropsOf<typeof CollapsibleRoot> & { extraProp?: string };

export const CustomCollapsible = component$((props: CustomProps) => {
  return (
    <Render fallback="div" {...props}>
      <Slot />
    </Render>
  );
});`;

      expect(detectsRenderComponentUsage(code)).toBe(true);
    });
  });

  describe("returnsRenderComponent", () => {
    it("should detect explicit return of Render component", () => {
      const code = `return (
    <Render fallback="button" {...props}>
      <Slot />
    </Render>
  );`;

      const ast = parseSync("test.tsx", code);
      const callback = ast.program.body[0]; // Return statement is the first node

      expect(returnsRenderComponent(callback, code)).toBe(true);
    });

    it("should detect implicit return of Render component (arrow function)", () => {
      const code = `(props) => (
    <Render fallback="button" {...props}>
      <Slot />
    </Render>
  )`;

      const ast = parseSync("test.tsx", code);
      const firstStatement = ast.program.body[0];
      const arrowFunction = (
        "expression" in firstStatement ? firstStatement.expression : null
      ) as Node;

      expect(returnsRenderComponent(arrowFunction, code)).toBe(true);
    });

    it("should not detect return of non-Render component", () => {
      const code = `return (
    <button {...props}>
      <Slot />
    </button>
  );`;

      const ast = parseSync("test.tsx", code);
      const callback = ast.program.body[0];

      expect(returnsRenderComponent(callback, code)).toBe(false);
    });

    it("should detect when Render is nested within returned JSX", () => {
      const code = `return (
    <div>
      <Render fallback="span">Content</Render>
      <button>Click me</button>
    </div>
  );`;

      const ast = parseSync("test.tsx", code);
      const callback = ast.program.body[0];

      // Even though the top-level return is a div, we detect Render anywhere in the tree
      // This is intentional - if Render is used anywhere, we want to inject AsChildTypes
      expect(returnsRenderComponent(callback, code)).toBe(true);
    });
  });

  describe("integration scenarios", () => {
    it("should detect Render usage in checkbox error component with cleanup", () => {
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

      expect(detectsRenderComponentUsage(code)).toBe(true);
    });

    it("should not detect Render in context files", () => {
      const code = `import { type Signal, createContextId } from "@qwik.dev/core";

export interface CheckboxContext {
  localId: string;
  isChecked: Signal<boolean>;
  isIndeterminate: Signal<boolean>;
  describedByIds: Signal<string>;
}

export const checkboxContextId = createContextId<CheckboxContext>("qds-checkbox");`;

      expect(detectsRenderComponentUsage(code)).toBe(false);
    });

    it("should detect Render in root component", () => {
      const code = `import { type PropsOf, Slot, component$, useContextProvider } from "@qwik.dev/core";
import { Render } from "../render/render";
import { checkboxContextId } from "./checkbox-context";

export const CheckboxRoot = component$<PropsOf<"div">>((props) => {
  const localId = useId();
  
  useContextProvider(checkboxContextId, {
    localId,
    // ... context setup
  });

  return (
    <Render fallback="div" data-qds-checkbox-root {...props}>
      <Slot />
    </Render>
  );
});`;

      expect(detectsRenderComponentUsage(code)).toBe(true);
    });

    it("should handle components with conditional Render", () => {
      const code = `import { type PropsOf, Slot, component$ } from "@qwik.dev/core";
import { Render } from "../render/render";

export const Button = component$((props: PropsOf<"button"> & { asChild?: boolean }) => {
  if (props.asChild) {
    return <Render fallback="button" {...props}><Slot /></Render>;
  }
  
  return <button {...props}><Slot /></button>;
});`;

      expect(detectsRenderComponentUsage(code)).toBe(true);
    });

    it("should handle components with conditional and nested Render", () => {
      const code = `import { type PropsOf, Slot, component$ } from "@qwik.dev/core";
import { Render } from "../render/render";

export const ComplexButton = component$((props: PropsOf<"button"> & { variant?: string }) => {
  if (props.variant === "custom") {
    return (
      <div class="wrapper">
        <Render fallback="button" {...props}>
          <Slot />
        </Render>
      </div>
    );
  }
  
  return <button {...props}><Slot /></button>;
});`;

      expect(detectsRenderComponentUsage(code)).toBe(true);
    });

    it("should handle nested returns with Render", () => {
      const code = `import { type PropsOf, Slot, component$ } from "@qwik.dev/core";
import { Render } from "../render/render";

export const Link = component$((props: PropsOf<"a">) => {
  const handleClick = () => {
    // Some logic
  };

  return (
    <Render 
      fallback="a"
      onClick$={handleClick}
      {...props}
    >
      <Slot />
    </Render>
  );
});`;

      expect(detectsRenderComponentUsage(code)).toBe(true);
    });
  });
});
