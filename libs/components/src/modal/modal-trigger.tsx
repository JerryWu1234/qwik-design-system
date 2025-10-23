import { $, type PropsOf, Slot, component$, useContext } from "@qwik.dev/core";
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
});
