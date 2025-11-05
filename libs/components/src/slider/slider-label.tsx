import { type PropsOf, Slot, component$, useContext } from "@qwik.dev/core";
import { Render } from "../render/render";
import { sliderContextId } from "./slider-context";

type PublicLabelProps = PropsOf<"span">;

/** Label component for slider that automatically connects to the slider via aria-labelledby */
export const SliderLabel = component$((props: PublicLabelProps) => {
  const context = useContext(sliderContextId);
  const labelId = `${context.localId}-label`;

  return (
    <Render {...props} fallback="span" id={labelId} ui-qds-slider-label>
      <Slot />
    </Render>
  );
});
