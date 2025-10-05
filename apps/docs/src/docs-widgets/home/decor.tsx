import { component$ } from "@qwik.dev/core";

export const Decor = component$(() => {
  return (
    <>
      {/* blue gradient */}
      <div class="fixed top-[20%] lg:left-[-50%] lg:top-[-20%] h-screen w-screen bg-hero-gradient-blue mix-blend-color z-[-1]" />

      {/* purple gradient */}
      <div class="fixed right-[-40%] top-[-10%] lg:right-[-50%] h-screen w-screen bg-hero-gradient-purple mix-blend-color z-[-1]" />

      <div
        aria-hidden="true"
        class={`absolute inset-0 z-[-2] bg-[url('./assets/decor/qds-svg-bg.svg')]`}
      />
    </>
  );
});
