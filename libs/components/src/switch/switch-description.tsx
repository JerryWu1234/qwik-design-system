import { type PropsOf, Slot, component$, useContext } from "@qwik.dev/core";
import { Render } from "../render/render";
import { switchContextId } from "./switch-context";

/** Description component for a switch that provides additional context */
export const SwitchDescription = component$<PropsOf<"div">>((props) => {
  const { ...restProps } = props;
  const context = useContext(switchContextId);
  const descriptionId = `${context.localId}-description`;

  return (
    <Render
      {...restProps}
      fallback="div"
      id={descriptionId}
      // The identifier for the switch description element
      ui-qds-switch-description
      // Indicates whether the switch is currently checked
      ui-checked={context.checked.value}
      // Indicates whether the switch is currently disabled
      ui-disabled={context.disabled.value}
    >
      <Slot />
    </Render>
  );
});
