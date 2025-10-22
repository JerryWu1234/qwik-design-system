import { type BindableProps, useBindings } from "@qds.dev/utils";
import {
  type PropsOf,
  type Signal,
  Slot,
  component$,
  createContextId,
  useContextProvider,
  useId,
  useSignal,
  useTask$
} from "@qwik.dev/core";
import { Render } from "../render/render";

type FieldContext = {
  localId: string;
  isDisabled: Signal<boolean>;
  isRequired: Signal<boolean>;
  isReadOnly: Signal<boolean>;
  name: string | undefined;
  rootValue: Signal<unknown>;
  describedByIds: Signal<string | undefined>;
};

export const fieldContextId = createContextId<FieldContext>("field-context");

type FieldRootProps = {
  name?: string;
  onChange$?: (value: unknown) => void;
} & Omit<PropsOf<"div">, "onChange$"> &
  BindableProps<{
    disabled: boolean;
    required: boolean;
    readOnly: boolean;
    value: unknown;
  }>;

export const FieldRoot = component$((props: FieldRootProps) => {
  const localId = useId();
  const isInitialRender = useSignal(true);
  const describedByIds = useSignal<string | undefined>(undefined);

  /**
   * Value can be given from either this Root component or a child component. Also value can be given from a custom control, which gets rootValue from the field context.
   */
  const {
    disabledSig: isDisabled,
    requiredSig: isRequired,
    readOnlySig: isReadOnly,
    valueSig: rootValue
  } = useBindings(props, {
    disabled: false,
    required: false,
    readOnly: false,
    value: undefined as unknown
  });

  useTask$(async ({ track, cleanup }) => {
    if (!props.onChange$) return;
    const value = track(() => rootValue.value);

    if (!isInitialRender.value) {
      await props.onChange$(value);
    }

    cleanup(() => {
      isInitialRender.value = false;
    });
  });

  const context: FieldContext = {
    localId,
    isDisabled,
    isRequired,
    name: props.name,
    isReadOnly,
    rootValue: rootValue,
    describedByIds
  };

  useContextProvider(fieldContextId, context);

  return (
    <Render fallback="div" {...props}>
      <Slot />
    </Render>
  );
});
