import { type PropsOf, Slot, component$, useConstant, useContext } from "@qwik.dev/core";
import { Render } from "../render/render";
import { fieldContextId } from "./field-root";

export const FieldDescription = component$((props: PropsOf<"div">) => {
  const context = useContext(fieldContextId);
  const descriptionId = `${context.localId}-description`;

  useConstant(() => {
    context.isDescription.value = true;
  });

  return (
    <Render fallback="div" {...props} id={descriptionId}>
      <Slot />
    </Render>
  );
});
