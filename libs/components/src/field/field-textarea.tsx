import {
  type BindableProps,
  destructureBindings,
  hasIdInList,
  useBindings
} from "@qds.dev/utils";
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
    const errorId = `${context.localId}-error`;

    const hasLocalValue = "value" in props || "bind:value" in props;

    const initialValues = { value: undefined as string | undefined };
    const { valueSig: localValue } = useBindings(props, initialValues);

    const finalValue = useConstant(() =>
      hasLocalValue ? localValue : (context.rootValue as Signal<string | undefined>)
    );

    const isError = useComputed$(() => {
      return hasIdInList(context.describedByIds.value, errorId);
    });

    const rest = destructureBindings(props, initialValues);

    return (
      <textarea
        {...rest}
        id={controlId}
        aria-describedby={context.describedByIds.value}
        aria-invalid={isError.value ? "true" : undefined}
        required={context.isRequired.value || props.required}
        disabled={context.isDisabled.value || props.disabled}
        readOnly={context.isReadOnly.value || props.readOnly}
        name={context.name || props.name}
        bind:value={finalValue}
      />
    );
  }
);
