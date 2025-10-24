import { $, type PropsOf, component$, useSignal, useStore } from "@qwik.dev/core";
import axe from "axe-core";
import { expect, test } from "vitest";
import { render } from "vitest-browser-qwik";
import { page, userEvent } from "vitest/browser";
import { Field } from "..";

// Top-level locator constants using data-testid
const Root = page.getByTestId("root");
const Label = page.getByTestId("label");
const Description = page.getByTestId("description");
const Error = page.getByTestId("error");
const Input = page.getByTestId("input");
const Textarea = page.getByTestId("textarea");

const BasicInput = component$((props: PropsOf<typeof Field.Root>) => {
  return (
    <Field.Root {...props} data-testid="root">
      <Field.Label data-testid="label">Username</Field.Label>
      <Field.Input data-testid="input" />
    </Field.Root>
  );
});

const BasicTextarea = component$((props: PropsOf<typeof Field.Root>) => {
  return (
    <Field.Root {...props} data-testid="root">
      <Field.Label data-testid="label">Bio</Field.Label>
      <Field.Textarea data-testid="textarea" />
    </Field.Root>
  );
});

test("should meet axe accessibility requirements with input", async () => {
  const screen = render(<BasicInput />);

  await expect.element(Root).toBeVisible();

  const results = await axe.run(screen.container);

  expect(results.violations).toHaveLength(0);
});

test("should meet axe accessibility requirements with textarea", async () => {
  const screen = render(<BasicTextarea />);

  await expect.element(Root).toBeVisible();

  const results = await axe.run(screen.container);

  expect(results.violations).toHaveLength(0);
});

test("input field is visible and can receive input", async () => {
  render(<BasicInput />);

  await expect.element(Input).toBeVisible();
  await userEvent.fill(Input, "test user");
  await expect.element(Input).toHaveValue("test user");
});

test("textarea field is visible and can receive input", async () => {
  render(<BasicTextarea />);

  await expect.element(Textarea).toBeVisible();
  await userEvent.fill(Textarea, "test bio");
  await expect.element(Textarea).toHaveValue("test bio");
});

test("label is associated with input", async () => {
  render(<BasicInput />);

  await expect.element(Label).toBeVisible();
  await expect.element(Input).toBeVisible();

  const inputElement = await Input.element();
  const labelElement = await Label.element();
  const inputId = inputElement?.getAttribute("id");
  const labelFor = labelElement?.getAttribute("for");

  expect(inputId).toBeTruthy();
  expect(labelFor).toBe(inputId);
});

test("label is associated with textarea", async () => {
  render(<BasicTextarea />);

  await expect.element(Label).toBeVisible();
  await expect.element(Textarea).toBeVisible();

  const textareaElement = await Textarea.element();
  const labelElement = await Label.element();
  const textareaId = textareaElement?.getAttribute("id");
  const labelFor = labelElement?.getAttribute("for");

  expect(textareaId).toBeTruthy();
  expect(labelFor).toBe(textareaId);
});

test("clicking label focuses input", async () => {
  render(<BasicInput />);

  await expect.element(Label).toBeVisible();
  await expect.element(Input).toBeVisible();

  await userEvent.click(Label);

  await expect.element(Input).toHaveFocus();
});

test("clicking label focuses textarea", async () => {
  render(<BasicTextarea />);

  await expect.element(Label).toBeVisible();
  await expect.element(Textarea).toBeVisible();

  await userEvent.click(Label);

  await expect.element(Textarea).toHaveFocus();
});

const WithDescription = component$(() => {
  return (
    <Field.Root data-testid="root">
      <Field.Label data-testid="label">Email</Field.Label>
      <Field.Description data-testid="description">
        We'll never share your email
      </Field.Description>
      <Field.Input data-testid="input" />
    </Field.Root>
  );
});

test("description is linked to input via aria-describedby", async () => {
  render(<WithDescription />);

  await expect.element(Label).toBeVisible();
  await expect.element(Input).toBeVisible();
  await expect.element(Description).toBeVisible();

  await expect.element(Description).toHaveAttribute("id");
  await expect.element(Input).toHaveAttribute("aria-describedby");

  const inputElement = await Input.element();
  const descriptionElement = await Description.element();
  const descriptionId = descriptionElement?.getAttribute("id");
  const describedBy = inputElement?.getAttribute("aria-describedby");

  expect(describedBy).toContain(descriptionId as string);
});

const WithError = component$(() => {
  const isError = useSignal(true);

  return (
    <Field.Root data-testid="root">
      <Field.Label data-testid="label">Password</Field.Label>
      <Field.Input data-testid="input" />
      {isError.value && (
        <Field.Error data-testid="error">Password is required</Field.Error>
      )}
    </Field.Root>
  );
});

test("error message is visible when present", async () => {
  render(<WithError />);

  await expect.element(Error).toBeVisible();
  await expect.element(Error).toHaveTextContent("Password is required");
});

test("error message is linked to input via aria-describedby", async () => {
  render(<WithError />);

  await expect.element(Label).toBeVisible();
  await expect.element(Input).toBeVisible();
  await expect.element(Error).toBeVisible();

  await expect.element(Error).toHaveAttribute("id");
  await expect.element(Input).toHaveAttribute("aria-describedby");

  const inputElement = await Input.element();
  const errorElement = await Error.element();
  const errorId = errorElement?.getAttribute("id");
  const describedBy = inputElement?.getAttribute("aria-describedby");

  expect(describedBy).toContain(errorId as string);
});

test("input has aria-invalid when error is present", async () => {
  render(<WithError />);

  await expect.element(Input).toHaveAttribute("aria-invalid", "true");
});

const WithDescriptionAndError = component$(() => {
  const isError = useSignal(true);

  return (
    <Field.Root data-testid="root">
      <Field.Label data-testid="label">Email</Field.Label>
      <Field.Description data-testid="description">
        Enter a valid email address
      </Field.Description>
      <Field.Input data-testid="input" />
      {isError.value && (
        <Field.Error data-testid="error">Email format is invalid</Field.Error>
      )}
    </Field.Root>
  );
});

test("both description and error are linked via aria-describedby", async () => {
  render(<WithDescriptionAndError />);

  await expect.element(Label).toBeVisible();
  await expect.element(Input).toBeVisible();
  await expect.element(Description).toBeVisible();
  await expect.element(Error).toBeVisible();

  await expect.element(Description).toHaveAttribute("id");
  await expect.element(Error).toHaveAttribute("id");
  await expect.element(Input).toHaveAttribute("aria-describedby");

  const inputElement = await Input.element();
  const descriptionElement = await Description.element();
  const errorElement = await Error.element();
  const descriptionId = descriptionElement?.getAttribute("id");
  const errorId = errorElement?.getAttribute("id");
  const describedBy = inputElement?.getAttribute("aria-describedby");

  expect(describedBy).toContain(descriptionId as string);
  expect(describedBy).toContain(errorId as string);
});

test("disabled field prevents input", async () => {
  render(<BasicInput disabled />);

  await expect.element(Input).toBeDisabled();
});

test("required attribute is present", async () => {
  render(<BasicInput required />);

  await expect.element(Input).toHaveAttribute("required");
});

test("readonly attribute prevents editing", async () => {
  render(<BasicInput readOnly />);

  await expect.element(Input).toHaveAttribute("readonly");
});

const FormValidation = component$(() => {
  const isError = useSignal(false);
  const handleSubmit$ = $((e: SubmitEvent) => {
    const form = e.target as HTMLFormElement;
    if (!form.checkValidity()) {
      isError.value = true;
    } else {
      isError.value = false;
    }
  });

  return (
    <form preventdefault:submit noValidate onSubmit$={handleSubmit$}>
      <Field.Root required name="username" data-testid="root">
        <Field.Label data-testid="label">Username</Field.Label>
        <Field.Input
          data-testid="input"
          onInput$={() => {
            isError.value = false;
          }}
        />
        {isError.value && (
          <Field.Error data-testid="error">Username is required</Field.Error>
        )}
      </Field.Root>
      <button type="submit">Submit</button>
    </form>
  );
});

test("form validation - error shows when required field is empty", async () => {
  render(<FormValidation />);

  await userEvent.click(page.getByText("Submit"));
  await expect.element(Error).toBeVisible();
});

test("form validation - error clears when input is provided", async () => {
  render(<FormValidation />);

  await userEvent.click(page.getByText("Submit"));
  await expect.element(Error).toBeVisible();

  await userEvent.fill(Input, "testuser");
  await expect.element(Error).not.toBeInTheDocument();
});

const ExternalStateInput = component$(() => {
  const signalValue = useSignal("initial value");
  const storeValue = useStore({ text: "initial value" });

  return (
    <div>
      <Field.Root
        data-testid="root"
        bind:value={signalValue}
        value={storeValue.text}
        onChange$={(newValue) => {
          storeValue.text = newValue as string;
        }}
      >
        <Field.Label data-testid="label">Name</Field.Label>
        <Field.Input data-testid="input" />
      </Field.Root>
      <button
        type="button"
        data-testid="change-value"
        onClick$={() => (storeValue.text = "value changed")}
      >
        Change Value
      </button>
      <button
        type="button"
        data-testid="change-signal"
        onClick$={() => (signalValue.value = "signal changed")}
      >
        Change Signal
      </button>
    </div>
  );
});

test("external value changes update input", async () => {
  render(<ExternalStateInput />);

  await expect.element(Input).toHaveValue("initial value");

  await userEvent.click(page.getByTestId("change-value"));

  await expect.element(Input).toHaveValue("value changed");
});

test("external signal changes update input", async () => {
  render(<ExternalStateInput />);

  await expect.element(Input).toHaveValue("initial value");

  await userEvent.click(page.getByTestId("change-signal"));

  await expect.element(Input).toHaveValue("signal changed");
});

const LocalValueOverride = component$(() => {
  const rootValue = useSignal("root value");
  const localValue = useSignal("local value");

  return (
    <div>
      <Field.Root data-testid="root" bind:value={rootValue}>
        <Field.Label data-testid="label">Name</Field.Label>
        <Field.Input data-testid="input" bind:value={localValue} />
      </Field.Root>
      <button
        type="button"
        data-testid="change-root"
        onClick$={() => (rootValue.value = "root changed")}
      >
        Change Root
      </button>
      <button
        type="button"
        data-testid="change-local"
        onClick$={() => (localValue.value = "local changed")}
      >
        Change Local
      </button>
    </div>
  );
});

test("local value takes precedence over root value", async () => {
  render(<LocalValueOverride />);

  await expect.element(Input).toHaveValue("local value");
});

test("local value changes independently from root", async () => {
  render(<LocalValueOverride />);

  await expect.element(Input).toHaveValue("local value");

  await userEvent.click(page.getByTestId("change-root"));
  await expect.element(Input).toHaveValue("local value");

  await userEvent.click(page.getByTestId("change-local"));
  await expect.element(Input).toHaveValue("local changed");
});

const TextareaExternalState = component$(() => {
  const textareaValue = useSignal("initial bio");

  return (
    <div>
      <Field.Root data-testid="root" bind:value={textareaValue}>
        <Field.Label data-testid="label">Bio</Field.Label>
        <Field.Textarea data-testid="textarea" />
      </Field.Root>
      <button
        type="button"
        data-testid="change-textarea"
        onClick$={() => (textareaValue.value = "updated bio")}
      >
        Update Bio
      </button>
    </div>
  );
});

test("textarea external signal changes update value", async () => {
  render(<TextareaExternalState />);

  await expect.element(Textarea).toHaveValue("initial bio");

  await userEvent.click(page.getByTestId("change-textarea"));

  await expect.element(Textarea).toHaveValue("updated bio");
});

const InputLocalValue = component$(() => {
  const rootValue = useSignal("root value");
  const storeValue = useStore({ text: "local value" });

  return (
    <div>
      <Field.Root data-testid="root" bind:value={rootValue}>
        <Field.Label data-testid="label">Name</Field.Label>
        <Field.Input
          data-testid="input"
          value={storeValue.text}
          onChange$={(e, el) => {
            storeValue.text = el.value;
          }}
        />
      </Field.Root>
      <button
        type="button"
        data-testid="change-local-value"
        onClick$={() => (storeValue.text = "value changed")}
      >
        Change Local Value
      </button>
    </div>
  );
});

test("input with local value prop takes precedence over root", async () => {
  render(<InputLocalValue />);

  await expect.element(Input).toHaveValue("local value");
});

test("input with local value prop changes independently from root", async () => {
  render(<InputLocalValue />);

  await expect.element(Input).toHaveValue("local value");

  await userEvent.click(page.getByTestId("change-local-value"));

  await expect.element(Input).toHaveValue("value changed");
});

const TextareaLocalValueOverride = component$(() => {
  const rootValue = useSignal("root bio");
  const localValue = useSignal("local bio");

  return (
    <div>
      <Field.Root data-testid="root" bind:value={rootValue}>
        <Field.Label data-testid="label">Bio</Field.Label>
        <Field.Textarea data-testid="textarea" bind:value={localValue} />
      </Field.Root>
      <button
        type="button"
        data-testid="change-root"
        onClick$={() => (rootValue.value = "root changed")}
      >
        Change Root
      </button>
      <button
        type="button"
        data-testid="change-local"
        onClick$={() => (localValue.value = "local changed")}
      >
        Change Local
      </button>
    </div>
  );
});

test("textarea local value takes precedence over root value", async () => {
  render(<TextareaLocalValueOverride />);

  await expect.element(Textarea).toHaveValue("local bio");
});

test("textarea local value changes independently from root", async () => {
  render(<TextareaLocalValueOverride />);

  await expect.element(Textarea).toHaveValue("local bio");

  await userEvent.click(page.getByTestId("change-root"));
  await expect.element(Textarea).toHaveValue("local bio");

  await userEvent.click(page.getByTestId("change-local"));
  await expect.element(Textarea).toHaveValue("local changed");
});

const TextareaLocalValue = component$(() => {
  const rootValue = useSignal("root bio");
  const storeValue = useStore({ text: "local bio" });

  return (
    <div>
      <Field.Root data-testid="root" bind:value={rootValue}>
        <Field.Label data-testid="label">Bio</Field.Label>
        <Field.Textarea
          data-testid="textarea"
          value={storeValue.text}
          onChange$={(e, el) => {
            storeValue.text = el.value;
          }}
        />
      </Field.Root>
      <button
        type="button"
        data-testid="change-local-value"
        onClick$={() => (storeValue.text = "value changed")}
      >
        Change Local Value
      </button>
    </div>
  );
});

test("textarea with local value prop takes precedence over root", async () => {
  render(<TextareaLocalValue />);

  await expect.element(Textarea).toHaveValue("local bio");
});

test("textarea with local value prop changes independently from root", async () => {
  render(<TextareaLocalValue />);

  await expect.element(Textarea).toHaveValue("local bio");

  await userEvent.click(page.getByTestId("change-local-value"));

  await expect.element(Textarea).toHaveValue("value changed");
});

test("field root has data-qds-scope attribute", async () => {
  render(<BasicInput />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).toHaveAttribute("data-qds-scope");
});

test("field root has data-disabled when disabled", async () => {
  render(<BasicInput disabled />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).toHaveAttribute("data-disabled");
});

test("field root does not have data-disabled when not disabled", async () => {
  render(<BasicInput />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).not.toHaveAttribute("data-disabled");
});

test("field root has data-required when required", async () => {
  render(<BasicInput required />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).toHaveAttribute("data-required");
});

test("field root does not have data-required when not required", async () => {
  render(<BasicInput />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).not.toHaveAttribute("data-required");
});

test("field root has data-readonly when readonly", async () => {
  render(<BasicInput readOnly />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).toHaveAttribute("data-readonly");
});

test("field root does not have data-readonly when not readonly", async () => {
  render(<BasicInput />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).not.toHaveAttribute("data-readonly");
});

test("field root has data-empty when value is empty", async () => {
  render(<BasicInput />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).toHaveAttribute("data-empty");
});

const FilledValueInput = component$(() => {
  const initialValue = useSignal("test value");
  return (
    <Field.Root data-testid="root" bind:value={initialValue}>
      <Field.Label data-testid="label">Username</Field.Label>
      <Field.Input data-testid="input" />
    </Field.Root>
  );
});

test("field root does not have data-empty when value exists", async () => {
  render(<FilledValueInput />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).not.toHaveAttribute("data-empty");
});

test("field root data-empty updates when input changes from empty to filled", async () => {
  render(<BasicInput />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).toHaveAttribute("data-empty");

  await userEvent.fill(Input, "test value");

  await expect.element(Root).not.toHaveAttribute("data-empty");
});

test("field root data-empty updates when input changes from filled to empty", async () => {
  render(<FilledValueInput />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).not.toHaveAttribute("data-empty");

  await userEvent.clear(Input);

  await expect.element(Root).toHaveAttribute("data-empty");
});

const DynamicStateInput = component$(() => {
  const disabled = useSignal(false);
  const required = useSignal(false);
  const readOnly = useSignal(false);

  return (
    <div>
      <Field.Root
        data-testid="root"
        bind:disabled={disabled}
        bind:required={required}
        bind:readOnly={readOnly}
      >
        <Field.Label data-testid="label">Username</Field.Label>
        <Field.Input data-testid="input" />
      </Field.Root>
      <button
        type="button"
        data-testid="toggle-disabled"
        onClick$={() => (disabled.value = !disabled.value)}
      >
        Toggle Disabled
      </button>
      <button
        type="button"
        data-testid="toggle-required"
        onClick$={() => (required.value = !required.value)}
      >
        Toggle Required
      </button>
      <button
        type="button"
        data-testid="toggle-readonly"
        onClick$={() => (readOnly.value = !readOnly.value)}
      >
        Toggle Readonly
      </button>
    </div>
  );
});

test("field root data-disabled updates dynamically", async () => {
  render(<DynamicStateInput />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).not.toHaveAttribute("data-disabled");

  await userEvent.click(page.getByTestId("toggle-disabled"));
  await expect.element(Root).toHaveAttribute("data-disabled");

  await userEvent.click(page.getByTestId("toggle-disabled"));
  await expect.element(Root).not.toHaveAttribute("data-disabled");
});

test("field root data-required updates dynamically", async () => {
  render(<DynamicStateInput />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).not.toHaveAttribute("data-required");

  await userEvent.click(page.getByTestId("toggle-required"));
  await expect.element(Root).toHaveAttribute("data-required");

  await userEvent.click(page.getByTestId("toggle-required"));
  await expect.element(Root).not.toHaveAttribute("data-required");
});

test("field root data-readonly updates dynamically", async () => {
  render(<DynamicStateInput />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).not.toHaveAttribute("data-readonly");

  await userEvent.click(page.getByTestId("toggle-readonly"));
  await expect.element(Root).toHaveAttribute("data-readonly");

  await userEvent.click(page.getByTestId("toggle-readonly"));
  await expect.element(Root).not.toHaveAttribute("data-readonly");
});

const AllAttributesInput = component$(() => {
  const fieldValue = useSignal("");
  return (
    <Field.Root data-testid="root" bind:value={fieldValue} disabled required readOnly>
      <Field.Label data-testid="label">Username</Field.Label>
      <Field.Input data-testid="input" />
    </Field.Root>
  );
});

test("field root has all data attributes simultaneously", async () => {
  render(<AllAttributesInput />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).toHaveAttribute("data-qds-scope");
  await expect.element(Root).toHaveAttribute("data-disabled");
  await expect.element(Root).toHaveAttribute("data-required");
  await expect.element(Root).toHaveAttribute("data-readonly");
  await expect.element(Root).toHaveAttribute("data-empty");
});
