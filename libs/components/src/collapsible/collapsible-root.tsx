import {
  type PropsOf,
  type QRL,
  type Signal,
  Slot,
  component$,
  useContextProvider,
  useId,
  useSignal,
  useTask$
} from "@qwik.dev/core";

import { type BindableProps, useBindings } from "@qds.dev/utils";
import { createContextId } from "@qwik.dev/core";
import { Render } from "../render/render";

export const collapsibleContextId = createContextId<CollapsibleContext>("Collapsible");

export interface CollapsibleContext {
  itemId: string;
  isOpen: Signal<boolean>;
  triggerRef: Signal<HTMLButtonElement | undefined>;
  contentRef: Signal<HTMLElement | undefined>;
  isDisabled: Signal<boolean>;
  isCollapsible: Signal<boolean>;
  disableUntilFound: boolean | undefined;
}

export type CollapsibleRootProps = PropsOf<"div"> & {
  id?: string;
  open?: boolean | undefined;
  onChange$?: QRL<(open: boolean) => void>;
  disabled?: boolean;
  collapsible?: boolean;
  /** If true, collapsible will be hidden instead of hidden until found */
  disableUntilFound?: boolean;
} & BindableProps<CollapsibleBinds>;

type CollapsibleBinds = {
  open: boolean;
  disabled: boolean;
  collapsible: boolean;
};

export const CollapsibleRoot = component$((props: CollapsibleRootProps) => {
  const { onChange$, id, disableUntilFound, ...rest } = props;

  const {
    openSig: isOpen,
    disabledSig: isDisabled,
    collapsibleSig: isCollapsible
  } = useBindings(props, {
    open: false,
    disabled: false,
    collapsible: true
  });

  const triggerRef = useSignal<HTMLButtonElement>();
  const contentRef = useSignal<HTMLElement>();

  const localId = useId();
  const itemId = id ?? localId;
  const isInitialLoadSig = useSignal(true);

  useTask$(function onChangeTask({ track, cleanup }) {
    track(() => isOpen.value);

    if (!isInitialLoadSig.value) {
      onChange$?.(isOpen.value);
    }

    cleanup(() => (isInitialLoadSig.value = false));
  });

  const context: CollapsibleContext = {
    isOpen,
    itemId,
    triggerRef,
    contentRef,
    isDisabled,
    isCollapsible,
    disableUntilFound
  };

  useContextProvider(collapsibleContextId, context);

  return (
    <Render
      id={itemId}
      fallback="div"
      data-qds-collapsible
      data-qds-scope
      data-disabled={isDisabled.value}
      data-open={context.isOpen.value}
      data-closed={!context.isOpen.value}
      aria-live="polite"
      {...rest}
    >
      <Slot />
    </Render>
  );
});
