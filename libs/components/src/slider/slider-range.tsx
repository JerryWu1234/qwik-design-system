import { component$, type PropsOf, useComputed$, useContext } from "@qwik.dev/core";
import { Render } from "../render/render";
import { sliderContextId } from "./slider-context";

/** Component that displays the filled range between min value and current value */
export const SliderRange = component$((props: PropsOf<"div">) => {
  const context = useContext(sliderContextId);

  const styles = useComputed$(() => {
    const range = context.max.value - context.min.value;
    if (range === 0) return { left: "0%", width: "0%" };

    // Check if this is a range slider by checking if value is an array
    if (!Array.isArray(context.sliderValue.value)) {
      const percentage = ((context.sliderValue.value - context.min.value) / range) * 100;
      return {
        left: "0%",
        width: `${Math.min(100, Math.max(0, percentage))}%`
      };
    }

    const startPercentage =
      ((context.startValue.value - context.min.value) / range) * 100;
    const endPercentage = ((context.endValue.value - context.min.value) / range) * 100;

    return {
      left: `${Math.min(100, Math.max(0, startPercentage))}%`,
      width: `${Math.min(100, Math.max(0, endPercentage - startPercentage))}%`
    };
  });

  return (
    <Render
      {...props}
      fallback="div"
      // Visual indicator showing the selected range between minimum and maximum values
      ui-qds-slider-range
      style={styles.value}
    />
  );
});
