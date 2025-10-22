import { appendId, removeId, useMountTask$ } from "@qds.dev/utils";
import { type PropsOf, Slot, component$, useContext, useSignal } from "@qwik.dev/core";
import { Render } from "../render/render";
import { checkboxContextId } from "./checkbox-context";

type PublicCheckboxErrorProps = PropsOf<"div">;

/** A component that displays error messages for a checkbox */
export const CheckboxError = component$((props: PublicCheckboxErrorProps) => {
  const context = useContext(checkboxContextId);
  const errorId = `${context.localId}-error`;
  const errorRef = useSignal<HTMLDivElement>();

  useMountTask$(({ cleanup }) => {
    context.describedByIds.value = appendId(context.describedByIds.value, errorId);

    cleanup(() => {
      context.describedByIds.value = removeId(context.describedByIds.value, errorId);
    });
  }, errorRef);

  return (
    // Identifier for the checkbox error message element
    <Render
      internalRef={errorRef}
      fallback="div"
      id={errorId}
      data-qds-checkbox-error
      {...props}
    >
      <Slot />
    </Render>
  );
});
