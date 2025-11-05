import {
  $,
  type PropsOf,
  type QRL,
  Slot,
  component$,
  useComputed$,
  useContext
} from "@qwik.dev/core";
import { Render } from "../render/render";
import { collapsibleContextId } from "./collapsible-root";

export type CollapsibleContentProps = PropsOf<"div"> & {
  onBeforematch$?: QRL<(event: Event) => void>;
};

export const CollapsibleContent = component$((props: CollapsibleContentProps) => {
  const context = useContext(collapsibleContextId);
  const contentId = `${context.itemId}-content`;

  const handleBeforeMatch$ = $(() => {
    context.isOpen.value = true;
  });

  const hiddenPath = useComputed$(() => {
    if (context.disableUntilFound) {
      return !context.isOpen.value ? true : undefined;
    }
    return !context.isOpen.value ? "until-found" : undefined;
  });

  return (
    <Render
      {...props}
      fallback="div"
      internalRef={context.contentRef}
      id={contentId}
      ui-qds-collapsible-content
      hidden={hiddenPath.value}
      onBeforematch$={[handleBeforeMatch$, props.onBeforematch$]}
    >
      <Slot />
    </Render>
  );
});
