import { type BindableProps, useBindings } from "@qds.dev/utils";
import {
  component$,
  type PropsOf,
  Slot,
  useComputed$,
  useContextProvider,
  useId,
  useSignal,
  useTask$
} from "@qwik.dev/core";
import { Render } from "../render/render";
import { type CheckboxContext, checkboxContextId } from "./checkbox-context";

export type PublicCheckboxRootProps<T extends boolean | "mixed" = boolean> = {
  /** Event handler called when the checkbox state changes */
  onChange$?: (checked: T) => void;
  /** Name attribute for the hidden input element */
  name?: string;
  /** Whether the checkbox is required */
  required?: boolean;
  /** Value attribute for the hidden input element */
  value?: string;
} & Omit<PropsOf<"div">, "onChange$"> &
  BindableProps<CheckboxBinds>;

type CheckboxBinds = {
  /* Determines whether the checkbox is checked */
  checked: boolean | "mixed";
  /** Whether the checkbox is disabled */
  disabled: boolean;
};

/** Root component that provides context and state management for the checkbox */
export const CheckboxRoot = component$((props: PublicCheckboxRootProps) => {
  const { onChange$, name, required, value, ...rest } = props;

  const { checkedSig: checked, disabledSig: isDisabled } = useBindings<CheckboxBinds>(
    props,
    {
      checked: false,
      disabled: false
    }
  );

  const isInitialRender = useSignal(true);
  const localId = useId();
  const triggerRef = useSignal<HTMLButtonElement>();
  const describedByIds = useSignal<string | undefined>(undefined);

  const isChecked = useComputed$(() => {
    return checked.value === true;
  });

  const context: CheckboxContext = {
    checked,
    isDisabled,
    localId,
    name,
    required,
    value,
    triggerRef,
    describedByIds
  };

  useContextProvider(checkboxContextId, context);

  useTask$(function handleChange({ track }) {
    track(() => checked.value);

    if (!isInitialRender.value) {
      onChange$?.(checked.value as boolean);
    }

    isInitialRender.value = false;
  });

  return (
    <Render
      {...rest}
      fallback="div"
      // Identifier for the root checkbox container
      data-qds-checkbox-root
      data-qds-scope
      // Indicates whether the checkbox is disabled
      aria-disabled={context.isDisabled.value ? "true" : "false"}
      data-checked={isChecked.value}
      data-mixed={checked.value === "mixed"}
      data-disabled={isDisabled.value}
    >
      <Slot />
    </Render>
  );
});
