import { Collapsible } from "@qds.dev/ui";
import { component$ } from "@qwik.dev/core";

export default component$(() => {
  return (
    <div>
      <p>Some visible text before</p>
      <Collapsible.Root>
        <Collapsible.Trigger class="not-ui-open:bg-red-500">
          Click to toggle
        </Collapsible.Trigger>
        <Collapsible.Content>
          <p>This is hidden searchable content that contains the word FINDME</p>
        </Collapsible.Content>
      </Collapsible.Root>
      <p>Some visible text after</p>
    </div>
  );
});
