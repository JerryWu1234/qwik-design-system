import { hasIdInList } from "@qds.dev/utils";
import {
  $,
  type PropsOf,
  Slot,
  component$,
  sync$,
  useComputed$,
  useContext
} from "@qwik.dev/core";
import { menuContextId } from "../menu/menu-root";
import { Render } from "../render/render";
import { checkboxContextId } from "./checkbox-context";

export type PublicCheckboxControlProps = PropsOf<"button">;

/** Interactive trigger component that handles checkbox toggling */
export const CheckboxTrigger = component$((props: PublicCheckboxControlProps) => {
  const context = useContext(checkboxContextId);
  const menuContext = useContext(menuContextId, null);
  const triggerId = `${context.localId}-trigger`;
  const errorId = `${context.localId}-error`;

  const role = useComputed$(() => {
    return menuContext ? "menuitemcheckbox" : "checkbox";
  });

  const handleClick$ = $(() => {
    if (context.checked.value === "mixed") {
      context.checked.value = true;
    } else {
      context.checked.value = !context.checked.value;
    }
  });

  const handleKeyDownSync$ = sync$((e: KeyboardEvent) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
  });

  const isError = useComputed$(() => {
    return hasIdInList(context.describedByIds.value, errorId);
  });

  return (
    <Render
      id={triggerId}
      internalRef={context.triggerRef}
      type="button"
      role={role.value}
      fallback="button"
      aria-checked={`${context.checked.value}`}
      aria-describedby={context.describedByIds.value}
      aria-invalid={isError.value ? "true" : undefined}
      disabled={context.isDisabled.value}
      onClick$={[handleClick$, props.onClick$]}
      onKeyDown$={[handleKeyDownSync$, props.onKeyDown$]}
      data-qds-checkbox-trigger
      {...props}
    >
      <Slot />
    </Render>
  );
});
