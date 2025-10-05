import { type PropsOf, Slot, component$, sync$, useContext } from "@qwik.dev/core";
import { Render } from "../render/render";
import { popoverContextId } from "./popover-root";

export const PopoverTrigger = component$((props: PropsOf<"button">) => {
  const context = useContext(popoverContextId);
  const panelId = `${context.localId}-panel`;

  const handleClick = sync$((e: PointerEvent, el: HTMLElement) => {
    const isHover = el.dataset.hover === "true";
    const isPointerClick = e.pointerId !== -1;

    if (isPointerClick && isHover) {
      e.preventDefault();
    }
  });

  return (
    <Render
      data-hover={context.hover}
      data-open={context.isOpenSig.value}
      data-closed={!context.isOpenSig.value}
      internalRef={context.triggerRef}
      popovertarget={panelId}
      onClick$={[handleClick, props.onClick$]}
      data-qds-popover-trigger
      fallback="button"
      {...props}
    >
      <Slot />
    </Render>
  );
});
