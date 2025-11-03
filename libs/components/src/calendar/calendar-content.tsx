import { Slot, component$, useStyles$ } from "@qwik.dev/core";
import { useContext } from "@qwik.dev/core";
import { PopoverContent } from "../popover/popover-content";
import { Render } from "../render/render";
import styles from "./calendar-content.css?inline";
import { calendarContextId } from "./calendar-context";

export const CalendarContent = component$(() => {
  useStyles$(styles);
  const context = useContext(calendarContextId);
  const mode = context.mode;

  if (mode === "popover") {
    return (
      <PopoverContent ui-qds-calendar-content ui-qds-calendar-popover-content>
        <Slot />
      </PopoverContent>
    );
  }
  return (
    <Render fallback="div" ui-qds-calendar-content ui-qds-calendar-inline-content>
      <Slot />
    </Render>
  );
});
