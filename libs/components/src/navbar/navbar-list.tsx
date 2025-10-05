import { type PropsOf, Slot, component$ } from "@qwik.dev/core";
import { Render } from "../render/render";

type NavbarListProps = PropsOf<"ul">;

export const NavbarList = component$((props: NavbarListProps) => {
  return (
    <Render fallback="ul" {...props}>
      <Slot />
    </Render>
  );
});
