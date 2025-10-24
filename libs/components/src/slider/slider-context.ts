import { type QRL, type Signal, createContextId } from "@qwik.dev/core";

export type ThumbType = "start" | "end";
export type SliderValue = number | [number, number];

export interface SliderContext {
  sliderValue: Signal<SliderValue>;
  startValue: Signal<number>;
  endValue: Signal<number>;
  min: Signal<number>;
  max: Signal<number>;
  step: Signal<number>;
  disabled: Signal<boolean>;
  isDragEnded: Signal<boolean>;
  setValue: QRL<(newValue: number, type?: ThumbType) => void>;
  calculateValue: QRL<(clientX: number, rect: DOMRect) => number>;
  thumbType: Signal<ThumbType | undefined>;
  localId: string;
  name?: string;
  required?: boolean;
}

export const sliderContextId = createContextId<SliderContext>("slider-context");
