import {
  type PropsOf,
  Slot,
  component$,
  useConstant,
  useContext,
  useSignal,
  useTask$
} from "@qwik.dev/core";
import { PopoverTrigger } from "../popover/popover-trigger";
import { navbarContextId } from "./navbar-root";

type NavbarItemTriggerProps = PropsOf<"button">;

export const NavbarItemTrigger = component$((props: NavbarItemTriggerProps) => {
  const context = useContext(navbarContextId);
  const triggerRef = useSignal<HTMLElement>();

  const index = useConstant(() => {
    const idx = context.numItems;
    context.numItems++;
    return idx;
  });

  useTask$(function registerRef() {
    // context.itemRefs.value[index] = triggerRef;
  });

  return (
    <PopoverTrigger ref={triggerRef} data-index={index} {...props}>
      <Slot />
    </PopoverTrigger>
  );
});
