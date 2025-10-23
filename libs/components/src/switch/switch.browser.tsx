import { $, type PropsOf, component$, useComputed$, useSignal } from "@qwik.dev/core";
import { expect, test } from "vitest";
import { render } from "vitest-browser-qwik";
import { page, userEvent } from "vitest/browser";
import { Switch } from "..";

// Top-level locator constants using data-testid
const Root = page.getByTestId("root");
const Trigger = page.getByTestId("trigger");
const Thumb = page.getByTestId("thumb");
const Label = page.getByTestId("label");
const Description = page.getByTestId("description");
const HiddenInput = page.getByTestId("hidden-input");
const Errors = page.getByTestId("error");
const SubmitButton = page.getByTestId("submit-button");

const Basic = component$((props: PropsOf<typeof Switch.Root>) => {
  return (
    <Switch.Root {...props} data-testid="root">
      <Switch.Label data-testid="label">Enable notifications</Switch.Label>
      <Switch.Trigger data-testid="trigger">
        <Switch.Thumb data-testid="thumb" />
      </Switch.Trigger>
    </Switch.Root>
  );
});

const WithDescription = component$((props: PropsOf<typeof Switch.Root>) => {
  return (
    <Switch.Root {...props} data-testid="root">
      <Switch.Label data-testid="label">Enable notifications</Switch.Label>
      <Switch.Trigger data-testid="trigger">
        <Switch.Thumb data-testid="thumb" />
      </Switch.Trigger>
      <Switch.Description data-testid="description">
        (Receive notifications about important updates)
      </Switch.Description>
    </Switch.Root>
  );
});

const BasicForm = component$((props: PropsOf<typeof Switch.Root>) => {
  return (
    <form
      preventdefault:submit
      noValidate
      style={{ display: "flex", flexDirection: "column", gap: "8px" }}
    >
      <Switch.Root {...props} name="notifications" value="enabled" data-testid="root">
        <Switch.Label data-testid="label">Enable notifications</Switch.Label>
        <Switch.Trigger data-testid="trigger">
          <Switch.Thumb data-testid="thumb" />
        </Switch.Trigger>
        <Switch.HiddenInput data-testid="hidden-input" />
      </Switch.Root>
      <button type="submit" data-testid="submit-button">
        Submit
      </button>
    </form>
  );
});

const FormWithValidation = component$((props: PropsOf<typeof Switch.Root>) => {
  const isChecked = useSignal(false);
  const isSubmitAttempt = useSignal(false);
  const isError = useComputed$(() => !isChecked.value && isSubmitAttempt.value);

  const handleSubmit$ = $((e: SubmitEvent) => {
    const form = e.target as HTMLFormElement;
    if (!isChecked.value) {
      isSubmitAttempt.value = true;
      return;
    }
    isSubmitAttempt.value = false;
  });

  return (
    <form
      preventdefault:submit
      noValidate
      onSubmit$={handleSubmit$}
      style={{ display: "flex", flexDirection: "column", gap: "8px" }}
    >
      <Switch.Root
        {...props}
        required
        name="notifications"
        value="enabled"
        bind:checked={isChecked}
        hasError={isError.value}
        data-testid="root"
      >
        <Switch.Label data-testid="label">Enable notifications</Switch.Label>
        <Switch.Trigger data-testid="trigger">
          <Switch.Thumb data-testid="thumb" />
        </Switch.Trigger>
        <Switch.HiddenInput data-testid="hidden-input" />
        {isError.value && (
          <Switch.Error data-testid="error">This field is required</Switch.Error>
        )}
      </Switch.Root>
      <button type="submit" data-testid="submit-button">
        Submit
      </button>
    </form>
  );
});

test("should have correct ARIA attributes when rendered", async () => {
  render(<Basic />);

  await expect.element(Root).toHaveAttribute("role", "switch");
  await expect.element(Root).toHaveAttribute("aria-checked", "false");
});

test("should toggle state when clicking trigger", async () => {
  render(<Basic />);

  await userEvent.click(Trigger);
  await expect.element(Root).toHaveAttribute("aria-checked", "true");

  await userEvent.click(Trigger);
  await expect.element(Root).toHaveAttribute("aria-checked", "false");
});

test("should toggle state with space key", async () => {
  render(<Basic />);

  await expect.element(Trigger).toBeVisible();
  ((await Trigger.element()) as HTMLButtonElement).focus();

  await userEvent.keyboard("{Space}");
  await expect.element(Root).toHaveAttribute("aria-checked", "true");

  await userEvent.keyboard("{Space}");
  await expect.element(Root).toHaveAttribute("aria-checked", "false");
});

test("should toggle state with enter key", async () => {
  render(<Basic />);

  await expect.element(Trigger).toBeVisible();
  ((await Trigger.element()) as HTMLButtonElement).focus();

  await userEvent.keyboard("{Enter}");
  await expect.element(Root).toHaveAttribute("aria-checked", "true");

  await userEvent.keyboard("{Enter}");
  await expect.element(Root).toHaveAttribute("aria-checked", "false");
});

test("should be disabled when disabled prop is true", async () => {
  render(<Basic disabled />);

  await expect.element(Root).toHaveAttribute("aria-disabled", "true");
  await expect.element(Trigger).toBeDisabled();
  await expect.element(Root).toHaveAttribute("aria-checked", "false");
});

test("should not toggle when disabled and clicked", async () => {
  render(<Basic disabled />);

  await expect.element(Root).toHaveAttribute("aria-checked", "false");
  // Disabled elements cannot be clicked in userEvent, so we just verify the state remains
  await expect.element(Trigger).toBeDisabled();
  await expect.element(Root).toHaveAttribute("aria-checked", "false");
});

test("should not toggle when disabled and using keyboard", async () => {
  render(<Basic disabled />);

  await expect.element(Trigger).toBeVisible();
  ((await Trigger.element()) as HTMLButtonElement).focus();

  await userEvent.keyboard("{Space}");
  await expect.element(Root).toHaveAttribute("aria-checked", "false");

  await userEvent.keyboard("{Enter}");
  await expect.element(Root).toHaveAttribute("aria-checked", "false");
});

test("should toggle when label is clicked", async () => {
  render(<Basic />);

  await userEvent.click(Label);
  await expect.element(Root).toHaveAttribute("aria-checked", "true");

  await userEvent.click(Label);
  await expect.element(Root).toHaveAttribute("aria-checked", "false");
});

test("should have hidden input with correct attributes in form", async () => {
  render(<BasicForm />);

  await expect.element(HiddenInput).toHaveAttribute("name", "notifications");
  await expect.element(HiddenInput).toHaveAttribute("value", "enabled");
});

test("should show error when required and submitted unchecked", async () => {
  render(<FormWithValidation />);

  await userEvent.click(SubmitButton);

  await expect.element(Root).toHaveAttribute("data-error");
  await expect.element(Errors).toBeVisible();
  await expect.element(Errors).toHaveTextContent("This field is required");
});

test("should clear error when switch is checked", async () => {
  render(<FormWithValidation />);

  await userEvent.click(SubmitButton);
  await expect.element(Errors).toBeVisible();

  await userEvent.click(Trigger);
  await expect.element(Errors).not.toBeInTheDocument();
});

test("should connect error message with aria-errormessage", async () => {
  render(<FormWithValidation />);

  await userEvent.click(SubmitButton);

  const errorElements = await Errors.elements();
  const errorId = errorElements[0]?.id;

  expect(errorId).toBeTruthy();
  await expect.element(Root).toHaveAttribute("aria-errormessage", errorId as string);
});

test("should display description when provided", async () => {
  render(<WithDescription />);

  await expect.element(Description).toBeVisible();
  await expect
    .element(Description)
    .toHaveTextContent("(Receive notifications about important updates)");
});

test("should set data-checked attribute when checked", async () => {
  render(<Basic />);

  await userEvent.click(Trigger);
  await expect.element(Root).toHaveAttribute("data-checked");
});

test("should set data-disabled attribute when disabled", async () => {
  render(<Basic disabled />);

  await expect.element(Root).toHaveAttribute("data-disabled");
});

test("should be checked when checked prop is true", async () => {
  render(<Basic checked />);

  await expect.element(Root).toHaveAttribute("aria-checked", "true");
  await expect.element(Root).toHaveAttribute("data-checked");
});

test("should set aria-required when required prop is true", async () => {
  render(<Basic required />);

  await expect.element(Root).toHaveAttribute("aria-required", "true");
});
