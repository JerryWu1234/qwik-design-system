import { type PropsOf, component$, useComputed$, useContext } from "@qwik.dev/core";
import { VisuallyHidden } from "../visually-hidden/visually-hidden";
import { sliderContextId } from "./slider-context";

type PublicSliderHiddenNativeInputProps = Omit<
  PropsOf<"input">,
  "type" | "value" | "min" | "max" | "step"
>;

export const SliderHiddenInput = component$(
  (props: PublicSliderHiddenNativeInputProps) => {
    const context = useContext(sliderContextId);

    const stringValue = useComputed$(() => {
      const value = context.sliderValue.value;
      return Array.isArray(value) ? value.join(",") : String(value);
    });

    return (
      <VisuallyHidden>
        <input
          {...props}
          type="hidden"
          tabIndex={-1}
          data-qds-slider-hidden-input
          name={context.name ?? props.name ?? undefined}
          required={context.required ?? props.required ?? undefined}
          value={stringValue.value}
        />
      </VisuallyHidden>
    );
  }
);
