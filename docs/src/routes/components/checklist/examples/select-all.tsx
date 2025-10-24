import { Checklist } from "@qds.dev/ui";
import { component$, useStyles$ } from "@qwik.dev/core";
import { LuCheck, LuMinus } from "@qwikest/icons/lucide";

export default component$(() => {
  useStyles$(styles);
  const items = Array.from({ length: 4 }, (_, i) => `Item ${i + 1}`);

  return (
    <Checklist.Root>
      <div>
        <Checklist.SelectAll class=" ui-checked:bg-red-500 ui-mixed:bg-yellow-500">
          <Checklist.SelectAllIndicator class="checkbox-indicator ui-checked:bg-red-500">
            <LuCheck data-check-icon />
            <LuMinus data-minus-icon />
          </Checklist.SelectAllIndicator>
        </Checklist.SelectAll>
      </div>
      <Checklist.Label>All items</Checklist.Label>
      <div style={{ marginLeft: "32px" }}>
        {items.map((item) => (
          <Checklist.Item
            style={{ marginBottom: "8px", marginTop: "8px" }}
            class="checkbox-root"
            key={item}
          >
            <span>
              <Checklist.ItemTrigger class="checkbox-trigger ui-checked:bg-red-500">
                <Checklist.ItemIndicator class="checkbox-indicator">
                  <LuCheck />
                </Checklist.ItemIndicator>
              </Checklist.ItemTrigger>
              <Checklist.ItemLabel>{item}</Checklist.ItemLabel>
            </span>
          </Checklist.Item>
        ))}
      </div>
    </Checklist.Root>
  );
});

// internal
import styles from "../../checkbox/examples/checkbox.css?inline";
