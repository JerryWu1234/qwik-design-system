import { appendId, removeId, useMountTask$ } from "@qds.dev/utils";
import { type PropsOf, Slot, component$, useContext, useSignal } from "@qwik.dev/core";
import { Render } from "../render/render";
import { fieldContextId } from "./field-root";

export const FieldDescription = component$((props: PropsOf<"div">) => {
  const context = useContext(fieldContextId);
  const descriptionId = `${context.localId}-description`;
  const descriptionRef = useSignal<HTMLDivElement>();

  useMountTask$(({ cleanup }) => {
    context.describedByIds.value = appendId(context.describedByIds.value, descriptionId);

    cleanup(() => {
      context.describedByIds.value = removeId(
        context.describedByIds.value,
        descriptionId
      );
    });
  }, descriptionRef);

  return (
    <Render {...props} internalRef={descriptionRef} fallback="div" id={descriptionId}>
      <Slot />
    </Render>
  );
});
