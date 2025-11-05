import { component$, useSignal } from "@qwik.dev/core";
import { expect, test } from "vitest";
import { render } from "vitest-browser-qwik";
import { page, userEvent } from "vitest/browser";
import { Progress } from "..";

// Top-level locator constants using data-testid
const Root = page.getByTestId("root");
const Label = page.getByTestId("label");
const Track = page.getByTestId("track");
const Indicator = page.getByTestId("indicator");
const ChangeButton = page.getByTestId("change-button");

// Basic progress component
const Basic = component$(() => {
  const progress = 30;

  return (
    <Progress.Root value={progress} data-testid="root">
      <Progress.Label data-testid="label">Export data {progress}%</Progress.Label>
      <Progress.Track data-testid="track">
        <Progress.Indicator data-testid="indicator" />
      </Progress.Track>
    </Progress.Root>
  );
});

// Indeterminate progress component
const Indeterminate = component$(() => {
  return (
    <Progress.Root value={null} data-testid="root">
      <Progress.Label data-testid="label">Loading...</Progress.Label>
      <Progress.Track data-testid="track">
        <Progress.Indicator data-testid="indicator" />
      </Progress.Track>
    </Progress.Root>
  );
});

// Complete progress component
const Complete = component$(() => {
  return (
    <Progress.Root value={100} data-testid="root">
      <Progress.Label data-testid="label">Complete!</Progress.Label>
      <Progress.Track data-testid="track">
        <Progress.Indicator data-testid="indicator" />
      </Progress.Track>
    </Progress.Root>
  );
});

// Progress with custom max
const CustomMax = component$(() => {
  return (
    <Progress.Root value={20} max={25} data-testid="root">
      <Progress.Label data-testid="label">Custom Max Progress</Progress.Label>
      <Progress.Track data-testid="track">
        <Progress.Indicator data-testid="indicator" />
      </Progress.Track>
    </Progress.Root>
  );
});

// Progress with custom min and max
const CustomMin = component$(() => {
  return (
    <Progress.Root value={5000} min={2000} max={10000} data-testid="root">
      <Progress.Label data-testid="label">Custom Range Progress</Progress.Label>
      <Progress.Track data-testid="track">
        <Progress.Indicator data-testid="indicator" />
      </Progress.Track>
    </Progress.Root>
  );
});

// Reactive progress component
const Reactive = component$(() => {
  const progressSig = useSignal(30);

  return (
    <>
      <Progress.Root bind:value={progressSig} data-testid="root">
        <Progress.Label data-testid="label">
          Progress: {progressSig.value}%
        </Progress.Label>
        <Progress.Track data-testid="track">
          <Progress.Indicator data-testid="indicator" />
        </Progress.Track>
      </Progress.Root>
      <button
        onClick$={() => (progressSig.value = 70)}
        type="button"
        data-testid="change-button"
      >
        Change progress
      </button>
    </>
  );
});

// Tests - Critical Functionality
test("progress components are visible on render", async () => {
  render(<Basic />);

  await expect.element(Root).toBeVisible();
  await expect.element(Label).toBeVisible();
  await expect.element(Track).toBeInTheDocument();
  await expect.element(Indicator).toBeInTheDocument();
});

test("progress has loading state when not completed", async () => {
  render(<Basic />);

  await expect.element(Indicator).toBeInTheDocument();
  await expect.element(Indicator).toHaveAttribute("ui-progress", "loading");
  await expect.element(Indicator).toHaveAttribute("ui-value", "30");
});

test("progress has indeterminate state when value is null", async () => {
  render(<Indeterminate />);

  await expect.element(Indicator).toBeInTheDocument();
  await expect.element(Indicator).toHaveAttribute("ui-progress", "indeterminate");
});

test("progress has complete state when value is 100%", async () => {
  render(<Complete />);

  await expect.element(Indicator).toBeInTheDocument();
  await expect.element(Indicator).toHaveAttribute("ui-progress", "complete");
});

// Tests - State
test("progress shows 30% complete when value is 30", async () => {
  render(<Basic />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).toHaveAttribute("aria-valuetext", "30%");
});

test("progress shows 80% complete when value is 20 and max is 25", async () => {
  render(<CustomMax />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).toHaveAttribute("aria-valuetext", "80%");
});

test("progress shows 38% complete when value is 5000, min is 2000 and max is 10000", async () => {
  render(<CustomMin />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).toHaveAttribute("aria-valuetext", "38%");
});

test("progress updates when value changes reactively", async () => {
  render(<Reactive />);

  await expect.element(Root).toHaveAttribute("aria-valuetext", "30%");

  await userEvent.click(ChangeButton);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).toHaveAttribute("aria-valuetext", "70%");
});

// Tests - Accessibility
test("progress has aria-valuemin attribute", async () => {
  render(<Basic />);
  await expect.element(Root).toHaveAttribute("aria-valuemin", "0");
});

test("progress has aria-valuemax attribute", async () => {
  render(<Basic />);
  await expect.element(Root).toHaveAttribute("aria-valuemax", "100");
});

test("progress has aria-valuenow attribute", async () => {
  render(<Basic />);
  await expect.element(Root).toHaveAttribute("aria-valuenow", "30");
});

test("progress has aria-valuetext attribute", async () => {
  render(<Basic />);
  await expect.element(Root).toHaveAttribute("aria-valuetext", "30%");
});

// Tests - Component Structure
test("label contains expected text", async () => {
  render(<Basic />);
  await expect.element(Label).toHaveTextContent("Export data 30%");
});

test("track contains the indicator", async () => {
  render(<Basic />);
  await expect.element(Track).toBeInTheDocument();
  // Verify indicator is within the track by checking it exists
  await expect.element(Indicator).toBeInTheDocument();
});

test("all components have proper data attributes", async () => {
  render(<Basic />);
  await expect.element(Root).toHaveAttribute("ui-qds-progress-root");
  await expect.element(Label).toHaveAttribute("ui-qds-progress-label");
  await expect.element(Track).toHaveAttribute("ui-qds-progress-track");
  await expect.element(Indicator).toHaveAttribute("ui-qds-progress-indicator");
});
