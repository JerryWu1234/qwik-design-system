import { type Signal, useComputed$ } from "@qwik.dev/core";
import { useBoundSignal } from "./bound-signal";

/**
 * Props that support both value based and signal based state
 */
export type BindableProps<T> = {
  [K in keyof T]?: T[K];
} & {
  [K in keyof T as `bind:${string & K}`]?: Signal<T[K]>;
};

/**
 * Signals returned by useBindings with Sig suffix
 *
 * @example
 * If T is { value: string, disabled: boolean }
 * Then SignalResults<T> is { valueSig: Signal<string>, disabledSig: Signal<boolean> }
 */
export type SignalResults<T> = {
  [K in keyof T as `${string & K}Sig`]: Signal<T[K]>;
};

/**
 * Creates synchronized signals that support both signal based state and resolved value state
 *
 * @param props Component props
 * @param initialValues
 * @returns Object with signals for each property (with Sig suffix)
 *
 * @example
 * const { disabledSig, valueSig } = useBindings(props, {
 *   disabled: false,
 *   value: ""
 * });
 *
 * @example
 * <Component value="jim" /> // value={signal.value}, value={store.property}
 * <Component bind:value={mySignal} />
 */
export function useBindings<T extends object>(
  props: BindableProps<T>,
  initialValues: T
): SignalResults<T> {
  const result = {} as SignalResults<T>;

  for (const key in initialValues) {
    type PropType = T[typeof key];
    type PropSignal = Signal<PropType>;
    type BindSignal = PropSignal | undefined;

    const propSig = useComputed$<PropType | undefined>(
      () => props[key] as PropType | undefined
    );
    const bindKey = `bind:${key}`;
    const resultKey = `${key}Sig` as keyof SignalResults<T>;

    const bindSignal = props[bindKey as keyof typeof props] as BindSignal;
    const initialValue = bindSignal?.value ?? propSig.value ?? initialValues[key];

    result[resultKey] = useBoundSignal(
      bindSignal,
      initialValue,
      propSig
    ) as SignalResults<T>[typeof resultKey];
  }

  return result;
}

/**
 * IF NOT USING RENDER COMPONENT:
 *
 * Removes keys and their `bind:` versions (e.g., `value` and `bind:value`) from the given props object.
 * Useful in headless or higher-order components to prevent forwarding value/signal props to DOM elements.
 *
 * @param props The original component props.
 * @param initialValues The same object passed to useBindings - keys are automatically extracted.
 * @returns New props without those keys.
 *
 * @example
 * const initialValues = { value: undefined as string | undefined };
 * const { valueSig } = useBindings(props, initialValues);
 * const rest = destructureBindings(props, initialValues);
 * // <div {...rest}/> will not get `value` or `bind:value`
 */
export function destructureBindings<T extends object, Props extends BindableProps<T>>(
  props: Props,
  initialValues: T
): Omit<Props, keyof T | keyof { [K in keyof T as `bind:${string & K}`]: unknown }> {
  const keysToOmit = new Set<string>();

  for (const key in initialValues) {
    keysToOmit.add(key as string);
    keysToOmit.add(`bind:${key as string}`);
  }

  const result = {} as Record<string, unknown>;
  for (const key in props) {
    if (!keysToOmit.has(key)) {
      result[key] = props[key];
    }
  }

  return result as Omit<
    Props,
    keyof T | keyof { [K in keyof T as `bind:${string & K}`]: unknown }
  >;
}
