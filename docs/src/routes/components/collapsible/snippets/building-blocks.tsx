import { Collapsible } from "@qds.dev/ui";
import { component$ } from "@qwik.dev/core";

export default component$(() => (
  <Collapsible.Root>
    <Collapsible.Trigger>Button</Collapsible.Trigger>
    <Collapsible.Content>Content</Collapsible.Content>
  </Collapsible.Root>
));
