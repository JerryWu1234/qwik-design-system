import { Checkbox } from "@qds.dev/ui";
import { component$, useSignal, useStyles$ } from "@qwik.dev/core";

export default component$(() => {
  useStyles$(styles);

  const isError = useSignal(true);

  const isChecked = useSignal<"mixed" | boolean>(false);

  return (
    <>
      <Checkbox.Root bind:checked={isChecked}>
        <Checkbox.Trigger class="size-10 bg-yellow-500 ui-checked:bg-red-500">
          <Checkbox.Indicator class="checkbox-indicator">Checked</Checkbox.Indicator>
        </Checkbox.Trigger>
        <Checkbox.Description>Description</Checkbox.Description>
        {isError.value && <Checkbox.Error>Error</Checkbox.Error>}
      </Checkbox.Root>
      <button type="button" onClick$={() => (isError.value = !isError.value)}>
        Toggle Error
      </button>
      <button type="button" onClick$={() => (isChecked.value = "mixed")}>
        Make mixed
      </button>
    </>
  );
});

import styles from "./checkbox.css?inline";
