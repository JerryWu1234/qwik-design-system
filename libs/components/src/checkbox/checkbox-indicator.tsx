import {
  type PropsOf,
  Slot,
  component$,
  useComputed$,
  useContext,
  useStyles$
} from "@qwik.dev/core";
import { checkboxContextId } from "./checkbox-context";
import "./checkbox.css";
import { Render } from "../render/render";
import styles from "./checkbox.css?inline";
export type PublicCheckboxIndicatorProps = PropsOf<"span">;
/** Visual indicator component showing the checkbox state */
export const CheckboxIndicator = component$<PublicCheckboxIndicatorProps>((props) => {
  useStyles$(styles);
  const context = useContext(checkboxContextId);

  const isHidden = useComputed$(() => context.checked.value === false);

  return (
    <Render
      {...props}
      fallback="span"
      // Indicates whether the indicator should be hidden based on checkbox state
      data-hidden={isHidden.value}
      data-qds-checkbox-indicator
      aria-hidden="true"
    >
      <Slot />
    </Render>
  );
});
