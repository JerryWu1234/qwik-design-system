import { component$, type PropsOf, Slot, sync$, useContext } from "@qwik.dev/core";
import { Render } from "../render/render";
import { popoverContextId } from "./popover-root";

export const PopoverTrigger = component$((props: PropsOf<"button">) => {
  const context = useContext(popoverContextId);
  const panelId = `${context.localId}-panel`;

  const handleClick = sync$((e: PointerEvent, el: HTMLElement) => {
    const isHover = el.getAttribute("ui-hover") === "true";
    const isPointerClick = e.pointerId !== -1;

    if (isPointerClick && isHover) {
      e.preventDefault();
    }
  });

  return (
    <Render
      ui-hover={context.hover}
      ui-open={context.isOpen.value}
      ui-closed={!context.isOpen.value}
      internalRef={context.triggerRef}
      popovertarget={panelId}
      onClick$={[handleClick, props.onClick$]}
      ui-qds-popover-trigger
      fallback="button"
      {...props}
    >
      <Slot />
    </Render>
  );
});
