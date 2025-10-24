import { Slider } from "@qds.dev/ui";
import { component$, useSignal, useStyles$ } from "@qwik.dev/core";
import styles from "./slider-custom.css?inline";

export default component$(() => {
  useStyles$(styles);

  const formData = useSignal<Record<string, FormDataEntryValue>>();

  return (
    <form
      preventdefault:submit
      onSubmit$={(e) => {
        const form = e.target as HTMLFormElement;
        formData.value = Object.fromEntries(new FormData(form));
      }}
      class="flex flex-col gap-4"
    >
      <VolumeSlider />
      <button
        type="submit"
        class="px-4 py-2 cursor-pointer bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Submit
      </button>
      {formData.value && (
        <div class="p-2 bg-gray-100 rounded">
          Submitted: {JSON.stringify(formData.value, null, 2)}
        </div>
      )}
    </form>
  );
});

export const VolumeSlider = component$(() => {
  return (
    <Slider.Root name="volume" value={50} class="slider-root">
      <Slider.Label>Volume</Slider.Label>
      <Slider.Track class="slider-track">
        <Slider.Range class="slider-range" />
        <Slider.Thumb class="slider-thumb" />
      </Slider.Track>
      <Slider.HiddenInput />
    </Slider.Root>
  );
});
