import { $, type PropsOf, Slot, component$, useContext } from "@qwik.dev/core";
import { Render } from "../render/render";
import { collapsibleContextId } from "./collapsible-root";

export const CollapsibleTrigger = component$<PropsOf<"button">>(
  ({ onClick$, ...props }) => {
    const context = useContext(collapsibleContextId);
    const contentId = `${context.itemId}-content`;
    const triggerId = `${context.itemId}-trigger`;

    const handleClick$ = $((e: MouseEvent) => {
      e.stopPropagation();
      context.isOpen.value = !context.isOpen.value;
    });

    return (
      <Render
        {...props}
        fallback="button"
        id={triggerId}
        internalRef={context.triggerRef}
        disabled={context.isDisabled.value}
        aria-disabled={context.isDisabled.value ? "true" : "false"}
        aria-expanded={context.isOpen.value}
        aria-controls={contentId}
        onClick$={[handleClick$, onClick$]}
      >
        <Slot />
      </Render>
    );
  }
);
