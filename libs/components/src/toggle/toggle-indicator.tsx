import {
  component$,
  type JSXOutput,
  type PropsOf,
  Slot,
  useComputed$,
  useContext
} from "@qwik.dev/core";
import { Render } from "../render/render";
import { toggleContextId } from "./toggle-root";

type ToggleIndicatorProps = PropsOf<"span"> & {
  fallback?: JSXOutput;
};

export const ToggleIndicator = component$((props: ToggleIndicatorProps) => {
  const { fallback, ...rest } = props;

  const context = useContext(toggleContextId);

  const isFallbackSig = useComputed$(() => props.fallback && !context.isPressedSig.value);

  return (
    <Render
      {...rest}
      fallback="span"
      ui-disabled={context.isDisabledSig.value}
      ui-pressed={context.isPressedSig.value}
      ui-qds-toggle-indicator
    >
      {isFallbackSig.value ? fallback : <Slot />}
    </Render>
  );
});
