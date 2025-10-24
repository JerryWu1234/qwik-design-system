import { Checklist } from "@qds.dev/ui";
import { component$, useStyles$ } from "@qwik.dev/core";
import { LuCheck } from "@qwikest/icons/lucide";

export default component$(() => {
  useStyles$(styles);
  const items = Array.from({ length: 4 }, (_, i) => `Item ${i + 1}`);

  return (
    <Checklist.Root class="checklist-root">
      {items.map((item) => (
        <Checklist.Item class="checkbox-root" key={item}>
          <Checklist.ItemTrigger class="checkbox-trigger ui-checked:bg-red-500">
            <Checklist.ItemIndicator class="checkbox-indicator">
              <LuCheck />
            </Checklist.ItemIndicator>
          </Checklist.ItemTrigger>
          <Checklist.ItemLabel>{item}</Checklist.ItemLabel>
        </Checklist.Item>
      ))}
    </Checklist.Root>
  );
});

// internal
import styles from "../../checkbox/examples/checkbox.css?inline";
