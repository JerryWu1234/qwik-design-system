import { component$ } from "@qwik.dev/core";
import { Home } from "../docs-widgets/home";
import { Spacer } from "../docs-widgets/spacer/spacer";

export default component$(() => {
  return (
    <>
      <Spacer class="h-16 lg:h-52" />
      <Home.Decor />
      <Home.Hero />
    </>
  );
});
