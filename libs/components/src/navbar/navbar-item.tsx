import { type PropsOf, Slot, component$ } from "@qwik.dev/core";
import { PopoverRoot } from "../popover/popover-root";

type NavbarItemProps = PropsOf<typeof PopoverRoot>;

export const NavbarItem = component$((props: NavbarItemProps) => {
  // TODO: make hover configurable in navbar root
  return (
    <PopoverRoot _fallback="li" {...props} hover>
      <Slot />
    </PopoverRoot>
  );
});
