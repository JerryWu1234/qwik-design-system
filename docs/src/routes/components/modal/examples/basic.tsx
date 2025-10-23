import { Modal } from "@qds.dev/ui";
import { component$ } from "@qwik.dev/core";

export default component$(() => {
  return (
    <Modal.Root>
      <Modal.Trigger class="ui-open:bg-red-500">Open Modal</Modal.Trigger>
      <Modal.Content>Some content</Modal.Content>
    </Modal.Root>
  );
});
