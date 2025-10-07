import { Popover } from "@qds.dev/ui";
import { component$, useSignal, useStyles$ } from "@qwik.dev/core";
import styles from "./popover.css?inline";

export default component$(() => {
  useStyles$(styles);

  const isRendered = useSignal(false);

  return (
    <>
      <button type="button" onClick$={() => (isRendered.value = true)}>
        Render Popover
      </button>
      <Popover.Root>
        <Popover.Trigger class="popover-trigger">Open Popover</Popover.Trigger>
        <Popover.Content class="popover-content">Popover Panel</Popover.Content>
      </Popover.Root>
      <p>isRendered: {isRendered.value ? "true" : "false"}</p>
    </>
  );
});
