import { Slot, component$ } from "@qwik.dev/core";
import { Header } from "../docs-widgets/header/header";

export default component$(() => {
  return (
    <>
      <Header />
      <div id="main-content">
        <Slot />
      </div>
    </>
  );
});
