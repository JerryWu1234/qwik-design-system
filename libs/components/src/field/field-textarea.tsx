import { type BindableProps, useBindings } from "@qds.dev/utils";
import {
  type PropsOf,
  type Signal,
  component$,
  useComputed$,
  useConstant,
  useContext
} from "@qwik.dev/core";
import { fieldContextId } from "./field-root";

export const FieldTextarea = component$(
  (props: PropsOf<"textarea"> & BindableProps<{ value: string }>) => {
    const context = useContext(fieldContextId);
    const controlId = `${context.localId}-control`;

    const describedByIds = useComputed$(() => {
      const ids = [
        context.isDescription.value ? `${context.localId}-description` : null,
        context.isError.value ? `${context.localId}-error` : null
      ]
        .filter(Boolean)
        .join(" ");

      return ids || undefined;
    });

    const hasLocalValue = "value" in props || "bind:value" in props;

    const { valueSig: localValue } = useBindings(props, {
      value: undefined as string | undefined
    });

    const finalValue = useConstant(() =>
      hasLocalValue ? localValue : (context.rootValue as Signal<string | undefined>)
    );

    return (
      <textarea
        {...props}
        id={controlId}
        aria-describedby={describedByIds.value}
        aria-invalid={context.isError.value ? "true" : undefined}
        required={context.isRequired.value || props.required}
        disabled={context.isDisabled.value || props.disabled}
        readOnly={context.isReadOnly.value || props.readOnly}
        name={context.name || props.name}
        bind:value={finalValue}
      />
    );
  }
);
