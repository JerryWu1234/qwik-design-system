import { type BindableProps, useBindings } from "@qds.dev/utils";
import {
  $,
  component$,
  type PropsOf,
  Slot,
  useComputed$,
  useConstant,
  useContextProvider,
  useId,
  useSignal,
  useStyles$,
  useTask$
} from "@qwik.dev/core";
import { Render } from "../render/render";
import styles from "./slider.css?inline";
import { type SliderValue, sliderContextId, type ThumbType } from "./slider-context";

type DivProps = Omit<
  PropsOf<"div">,
  "value" | "min" | "max" | "step" | "disabled" | "onChange$"
>;

interface PublicSliderProps {
  onChange$?: (value: SliderValue) => void;
  onChangeEnd$?: (value: SliderValue) => void;
  name?: string;
  required?: boolean;
}

type PublicRootProps = DivProps &
  PublicSliderProps &
  BindableProps<{
    value: SliderValue;
    disabled: boolean;
    min: number;
    max: number;
    step: number;
  }>;
/** Root component that provides slider context and handles core slider functionality */
export const SliderRoot = component$<PublicRootProps>((props) => {
  useStyles$(styles);

  const localId = useId();
  const labelId = `${localId}-label`;

  const {
    valueSig: sliderValue,
    disabledSig: disabled,
    minSig: min,
    maxSig: max,
    stepSig: step
  } = useBindings(props, {
    value: 0 as SliderValue,
    disabled: false,
    min: 0,
    max: 100,
    step: 1
  });

  const isRange = useConstant(() => Array.isArray(sliderValue.value));

  const startValue = useSignal(
    isRange ? (Array.isArray(sliderValue.value) ? sliderValue.value[0] : 0) : 0
  );

  const endValue = useSignal(
    isRange ? (Array.isArray(sliderValue.value) ? sliderValue.value[1] : 100) : 100
  );

  const isInitialRender = useSignal(true);

  useTask$(({ track }) => {
    let currentValue: SliderValue;

    if (isRange) {
      const start = track(() => startValue.value);
      const end = track(() => endValue.value);
      currentValue = [start, end];
    } else {
      currentValue = track(() => sliderValue.value);
    }

    if (isInitialRender.value) {
      isInitialRender.value = false;
      return;
    }

    props.onChange$?.(currentValue);
  });

  const isDragEnded = useSignal(false);

  useTask$(({ track }) => {
    const dragEnded = track(() => isDragEnded.value);

    if (dragEnded && props.onChangeEnd$) {
      if (!isRange) {
        props.onChangeEnd$(sliderValue.value);
      } else {
        props.onChangeEnd$([startValue.value, endValue.value]);
      }
      isDragEnded.value = false;
    }
  });

  const setValue = $((newValue: number, type?: "start" | "end") => {
    if (!isRange) {
      sliderValue.value = newValue;
    } else if (type === "start" && newValue <= endValue.value) {
      startValue.value = newValue;
    } else if (type === "end" && newValue >= startValue.value) {
      endValue.value = newValue;
    }
  });

  const calculateValue = $((clientX: number, rect: DOMRect) => {
    if (!rect.width) return min.value;
    const position = (clientX - rect.left) / rect.width;
    const range = max.value - min.value;
    let newValue = min.value + range * position;

    if (step.value > 0) {
      newValue = Math.round(newValue / step.value) * step.value;
    }

    return Math.max(min.value, Math.min(max.value, newValue));
  });

  const context = {
    sliderValue,
    startValue,
    endValue,
    min,
    max,
    step,
    disabled,
    isDragEnded,
    setValue,
    calculateValue,
    thumbType: useSignal<ThumbType | undefined>(undefined),
    localId,
    name: props.name,
    required: props.required
  };

  useContextProvider(sliderContextId, context);

  const ariaValueNow = useComputed$(() => {
    if (isRange) return undefined;
    return typeof sliderValue.value === "number" ? sliderValue.value : undefined;
  });

  const { onChange$: _onChange$, onChangeEnd$: _onChangeEnd$, ...rest } = props;

  return (
    <Render
      {...rest}
      fallback="div"
      ui-qds-slider-root
      role={isRange ? "group" : "slider"}
      aria-disabled={disabled.value}
      aria-valuemin={min.value}
      aria-valuemax={max.value}
      aria-valuenow={ariaValueNow.value}
      aria-labelledby={labelId}
    >
      <Slot />
    </Render>
  );
});
