import { type PropsOf, Slot, component$ } from "@qwik.dev/core";
import { Render } from "../render/render";

/** A container component for slider markers */
export const SliderMarkerGroup = component$((props: PropsOf<"div">) => {
  return (
    // Container element for grouping slider markers
    <Render {...props} fallback="div" data-qds-slider-marker-group>
      <Slot />
    </Render>
  );
});
