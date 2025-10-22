import { appendId, removeId, useMountTask$ } from "@qds.dev/utils";
import { type PropsOf, Slot, component$, useContext, useSignal } from "@qwik.dev/core";
import { Render } from "../render/render";
import { checkboxContextId } from "./checkbox-context";

type PublicCheckboxDescriptionProps = PropsOf<"div">;
/** A component that renders the description text for a checkbox */
export const CheckboxDescription = component$((props: PublicCheckboxDescriptionProps) => {
  const context = useContext(checkboxContextId);
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
    // Identifier for the checkbox description element
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
});
