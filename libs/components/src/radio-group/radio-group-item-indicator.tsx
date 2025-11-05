import { type PropsOf, Slot, component$, useContext } from "@qwik.dev/core";
import { Render } from "../render/render";
import { radioGroupItemContextId } from "./radio-group-item";

type PublicIndicatorProps = PropsOf<"span">;

export const RadioGroupItemIndicator = component$((props: PublicIndicatorProps) => {
  const itemContext = useContext(radioGroupItemContextId);

  return (
    <Render
      {...props}
      fallback="span"
      ui-qds-indicator
      ui-checked={itemContext.isSelectedSig.value}
      ui-hidden={!itemContext.isSelectedSig.value}
      aria-hidden={!itemContext.isSelectedSig.value ? "true" : "false"}
    >
      <Slot />
    </Render>
  );
});
