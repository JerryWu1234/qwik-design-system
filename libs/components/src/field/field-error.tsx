import { appendId, removeId, useMountTask$ } from "@qds.dev/utils";
import { type PropsOf, Slot, component$, useContext, useSignal } from "@qwik.dev/core";
import { Render } from "../render/render";
import { fieldContextId } from "./field-root";

export const FieldError = component$((props: PropsOf<"div">) => {
  const context = useContext(fieldContextId);
  const errorId = `${context.localId}-error`;
  const errorRef = useSignal<HTMLDivElement>();

  useMountTask$(({ cleanup }) => {
    context.describedByIds.value = appendId(context.describedByIds.value, errorId);

    cleanup(() => {
      context.describedByIds.value = removeId(context.describedByIds.value, errorId);
    });
  }, errorRef);

  return (
    <Render fallback="div" {...props} id={errorId}>
      <Slot />
    </Render>
  );
});
