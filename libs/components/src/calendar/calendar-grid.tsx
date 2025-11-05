import { $, component$, type PropsOf, type QRL, Slot, useContext } from "@qwik.dev/core";
import { calendarContextId } from "./calendar-context";
import type { ISODate, Month } from "./types";

type PublicCalendarGridProps = PropsOf<"div"> & {
  /** Event handler called when a date is selected */
  onDateChange$?: QRL<(date: ISODate) => void>;
};

const ACTION_KEYS = [
  "enter",
  " ",
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "home",
  "end",
  "pageup",
  "pagedown"
] as const;

type ActionKey = (typeof ACTION_KEYS)[number];

const isActionKey = (key: string): key is ActionKey => {
  return (ACTION_KEYS as readonly string[]).includes(key);
};

const isISODate = (value: string): value is ISODate => {
  return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value);
};

const isMonth = (value: string): value is Month => {
  return /^(0[1-9]|1[0-2])$/.test(value);
};

/** A component that renders the main calendar grid structure */
export const CalendarGrid = component$<PublicCalendarGridProps>((props) => {
  const context = useContext(calendarContextId);

  const decreaseMonth = $(() => {
    const currentMonth = Number.parseInt(context.monthToRender.value);

    if (currentMonth === 1) {
      context.monthToRender.value = "12";
      context.yearToRender.value--;
      return;
    }

    const newMonth = String(currentMonth - 1).padStart(2, "0");
    if (isMonth(newMonth)) {
      context.monthToRender.value = newMonth;
    }
  });

  const increaseMonth = $(() => {
    const currentMonth = Number.parseInt(context.monthToRender.value);

    if (currentMonth === 12) {
      context.monthToRender.value = "01";
      context.yearToRender.value++;
      return;
    }

    const newMonth = String(currentMonth + 1).padStart(2, "0");
    if (isMonth(newMonth)) {
      context.monthToRender.value = newMonth;
    }
  });

  const updateDateFocused = $(async (e: KeyboardEvent, gridBody: HTMLDivElement) => {
    const key = e.key.toLowerCase();
    if (!isActionKey(key)) return;
    const elFocus = document.activeElement;
    if (elFocus?.tagName.toLowerCase() !== "button") return;

    const buttons = Array.from(gridBody.getElementsByTagName("button"));
    if (!(elFocus instanceof HTMLButtonElement)) return;
    const idx = buttons.indexOf(elFocus);
    const currentDateValue = elFocus?.getAttribute("ui-value");
    if (!currentDateValue || !isISODate(currentDateValue)) return;
    const currentDate = currentDateValue;

    const getNewIndex = (step: number) => {
      const newIdx = idx + step;
      if (newIdx < 0 || newIdx >= buttons.length) return idx;
      return buttons[newIdx].hasAttribute("disabled") ? idx : newIdx;
    };

    const handleDateChange = async (step: number, newIdx: number) => {
      if (idx === newIdx) {
        const newDate = adjustDate(currentDate, { days: step });
        if (newDate) {
          updateFocus(newIdx, newDate);
          if (step < 0) {
            await decreaseMonth();
          } else {
            await increaseMonth();
          }
        }
      } else {
        updateFocus(newIdx);
      }
    };

    const adjustDate = (
      date: string,
      adjustment: {
        days?: number;
        months?: number;
      }
    ): ISODate | null => {
      const d = new Date(date);
      if (adjustment.days) d.setDate(d.getDate() + adjustment.days);
      if (adjustment.months) d.setMonth(d.getMonth() + adjustment.months);
      const isoString = d.toISOString().split("T")[0];
      return isISODate(isoString) ? isoString : null;
    };

    const updateFocus = (newIdx: number, newDate: ISODate | null = null) => {
      const dateValue = buttons[newIdx].getAttribute("ui-value");
      const validDateValue = dateValue && isISODate(dateValue) ? dateValue : null;
      const dateToSet = newDate ?? validDateValue;
      if (!dateToSet) return;
      context.dateToFocus.value = dateToSet;
      buttons[newIdx].focus({ preventScroll: true });
    };

    const handleMonthChange = async (date: ISODate, currentMonth: string) => {
      const month = date.split("-")[1];
      if (month !== currentMonth) {
        if (month < currentMonth) {
          await decreaseMonth();
        } else {
          await increaseMonth();
        }
      }
    };

    switch (key) {
      case "arrowup":
      case "arrowdown": {
        const step = key === "arrowup" ? -7 : 7;
        await handleDateChange(step, getNewIndex(step));
        break;
      }

      case "arrowleft":
      case "arrowright": {
        const step = key === "arrowleft" ? -1 : 1;
        await handleDateChange(step, getNewIndex(step));
        break;
      }

      case " ":
      case "enter": {
        elFocus.click();
        break;
      }

      case "pageup":
      case "pagedown": {
        const step = key === "pageup" ? -1 : 1;
        const newDate = adjustDate(currentDate, { months: step });
        if (newDate) {
          updateFocus(idx, newDate);
          if (step < 0) {
            await decreaseMonth();
          } else {
            await increaseMonth();
          }
        }
        break;
      }

      case "home": {
        const rowStartIndex = Math.floor(idx / 7) * 7;
        const newDateValue = buttons[rowStartIndex].getAttribute("ui-value");
        if (!newDateValue || !isISODate(newDateValue)) break;
        const newDate = newDateValue;
        await handleMonthChange(newDate, context.monthToRender.value);
        updateFocus(rowStartIndex, newDate);
        break;
      }

      case "end": {
        const rowEndIndex = Math.min(
          Math.ceil((idx + 1) / 7) * 7 - 1,
          buttons.length - 1
        );
        const newDateValue = buttons[rowEndIndex].getAttribute("ui-value");
        if (!newDateValue || !isISODate(newDateValue)) break;
        const newDate = newDateValue;
        await handleMonthChange(newDate, context.monthToRender.value);
        updateFocus(rowEndIndex, newDate);
        break;
      }
    }
  });

  const { onDateChange$: _onDateChange$, ...divProps } = props;

  return (
    // The main calendar grid container
    <div
      ui-qds-calendar-grid
      role="grid"
      {...divProps}
      ui-show-week-numbers={context.showWeekNumber ? "true" : "false"}
    >
      {context.showDaysOfWeek && (
        // The header section of the calendar grid
        // biome-ignore lint/a11y/useFocusableInteractive: The header section contains no elements that a user needs to interact with or focus on.
        <div ui-qds-calendar-grid-header-row role="row">
          {context.showWeekNumber && (
            <div role="columnheader" ui-qds-calendar-grid-header-cell>
              Wk
            </div>
          )}
          {context.daysOfWeek.map((day) => (
            <div
              key={day}
              role="columnheader"
              aria-label={day}
              // A cell in the calendar grid header
              ui-qds-calendar-grid-header-cell
            >
              {day.slice(0, 2).normalize("NFD").replace(/\p{M}/gu, "")}
            </div>
          ))}
        </div>
      )}
      <div
        // The body section of the calendar grid
        ui-qds-calendar-grid-body
        preventdefault:keydown
        onKeyDown$={[
          $(async (e: KeyboardEvent, target: HTMLDivElement) => {
            await updateDateFocused(e, target);
          })
        ]}
      >
        <Slot />
      </div>
    </div>
  );
});
