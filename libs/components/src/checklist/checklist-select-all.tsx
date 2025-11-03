import { type PropsOf, Slot, component$ } from "@qwik.dev/core";
import { CheckboxTrigger } from "../checkbox/checkbox-trigger";

export const ChecklistSelectAll = component$((props: PropsOf<typeof CheckboxTrigger>) => {
  return (
    // Identifies the trigger element for the select all checkbox
    <CheckboxTrigger
      ui-qds-checklist-select-all-trigger
      {...props}
      ui-qds-checkbox-trigger={undefined}
    >
      <Slot />
    </CheckboxTrigger>
  );
});
