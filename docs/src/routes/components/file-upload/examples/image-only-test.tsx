import { FileUpload } from "@qds.dev/ui";
import { component$ } from "@qwik.dev/core";

export default component$(() => {
  return (
    <FileUpload.Root
      accept="image/*"
      onChange$={(files) => {
        console.log("Files changed:", files);
      }}
    >
      <FileUpload.HiddenInput />
      <FileUpload.Dropzone>
        <p>Drop image here or</p>
        <FileUpload.Trigger>Select Image</FileUpload.Trigger>
      </FileUpload.Dropzone>
    </FileUpload.Root>
  );
});
