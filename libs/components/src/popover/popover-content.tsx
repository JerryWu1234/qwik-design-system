import { $, type PropsOf, Slot, component$, useContext } from "@qwik.dev/core";
import type { CorrectedToggleEvent } from "@qwik.dev/core/internal";
import { Render } from "../render/render";
import { popoverContextId } from "./popover-root";

export const PopoverContent = component$((props: PropsOf<"div">) => {
  const context = useContext(popoverContextId);
  const panelId = `${context.localId}-panel`;

  const handleToggle$ = $((e: CorrectedToggleEvent) => {
    // prevent InvalidStateError: browser already toggled, skip useTask$ re-execution
    context.canExternallyChange.value = false;
    context.isOpen.value = e.newState === "open";

    // re-enable after reactive cycle completes
    queueMicrotask(() => {
      context.canExternallyChange.value = true;
    });
  });

  return (
    <Render
      hidden={context.isHidden.value}
      onToggle$={[handleToggle$, props.onToggle$]}
      popover="auto"
      id={panelId}
      internalRef={context.contentRef}
      fallback="div"
      data-qds-popover-content
      {...props}
    >
      <Slot />
    </Render>
  );
});
