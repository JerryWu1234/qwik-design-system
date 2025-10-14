import { type PropsOf, Slot, component$, useContext } from "@qwik.dev/core";
import { Label } from "../label/label";
import { fieldContextId } from "./field-root";

export const FieldLabel = component$((props: PropsOf<typeof Label>) => {
  const context = useContext(fieldContextId);
  const controlId = `${context.localId}-control`;

  return (
    <Label {...props} for={controlId}>
      <Slot />
    </Label>
  );
});
