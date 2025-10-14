import { type PropsOf, Slot, component$, useContext, useTask$ } from "@qwik.dev/core";
import { Render } from "../render/render";
import { fieldContextId } from "./field-root";

export const FieldError = component$((props: PropsOf<"div">) => {
  const context = useContext(fieldContextId);
  const errorId = `${context.localId}-error`;

  useTask$(({ cleanup }) => {
    cleanup(() => {
      if (context.isInitialRender.value) return;
      context.isError.value = false;
    });

    context.isError.value = true;
    context.isInitialRender.value = false;
  });

  return (
    <Render fallback="div" {...props} id={errorId}>
      <Slot />
    </Render>
  );
});
