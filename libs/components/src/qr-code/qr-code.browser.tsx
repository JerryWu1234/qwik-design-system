import { type PropsOf, component$ } from "@qwik.dev/core";
import { expect, test } from "vitest";
import { render } from "vitest-browser-qwik";
import { page } from "vitest/browser";
import { QRCode } from "..";

// Top-level locator constants using data-testid
const Root = page.getByTestId("root");
const Frame = page.getByTestId("frame");
const Svg = page.getByTestId("svg");
const Path = page.getByTestId("path");
const Overlay = page.getByTestId("overlay");
const OverlayImg = page.getByTestId("overlay-img");

const Basic = component$((props: PropsOf<typeof QRCode.Root>) => {
  return (
    <QRCode.Root value="https://qwik.dev" data-testid="root" {...props}>
      <QRCode.Frame data-testid="frame">
        <QRCode.PatternSvg width={200} height={200} data-testid="svg">
          <QRCode.PatternPath fill="black" data-testid="path" />
        </QRCode.PatternSvg>
      </QRCode.Frame>
    </QRCode.Root>
  );
});

const WithOverlay = component$(() => {
  return (
    <QRCode.Root value="https://qwik.dev" data-testid="root">
      <QRCode.Frame data-testid="frame">
        <QRCode.PatternSvg width={200} height={200} data-testid="svg">
          <QRCode.PatternPath fill="black" data-testid="path" />
        </QRCode.PatternSvg>
        <QRCode.Overlay data-testid="overlay">
          <img
            src="https://qwik.dev/favicon.svg"
            alt="Qwik logo"
            width={40}
            height={40}
            data-testid="overlay-img"
          />
        </QRCode.Overlay>
      </QRCode.Frame>
    </QRCode.Root>
  );
});

const WithCustomColors = component$(() => {
  return (
    <QRCode.Root value="https://qwik.dev" data-testid="root">
      <QRCode.Frame data-testid="frame" style={{ backgroundColor: "rgb(255, 255, 0)" }}>
        <QRCode.PatternSvg width={200} height={200} data-testid="svg">
          <QRCode.PatternPath fill="blue" data-testid="path" />
        </QRCode.PatternSvg>
        <QRCode.Overlay data-testid="overlay">
          <img
            src="https://qwik.dev/favicon.svg"
            alt="Qwik logo"
            width={40}
            height={40}
            data-testid="overlay-img"
          />
        </QRCode.Overlay>
      </QRCode.Frame>
    </QRCode.Root>
  );
});

const Multiple = component$(() => {
  return (
    <div>
      <QRCode.Root value="https://qwik.dev" data-testid="root">
        <QRCode.Frame data-testid="frame">
          <QRCode.PatternSvg width={200} height={200} data-testid="svg">
            <QRCode.PatternPath fill="black" data-testid="path" />
          </QRCode.PatternSvg>
        </QRCode.Frame>
      </QRCode.Root>
      <QRCode.Root value="https://builder.io" data-testid="root">
        <QRCode.Frame data-testid="frame">
          <QRCode.PatternSvg width={200} height={200} data-testid="svg">
            <QRCode.PatternPath fill="black" data-testid="path" />
          </QRCode.PatternSvg>
        </QRCode.Frame>
      </QRCode.Root>
    </div>
  );
});

test("SVG should be visible", async () => {
  render(<Basic />);
  await expect.element(Svg).toBeVisible();
});

test("should have correct size", async () => {
  render(<Basic />);

  await expect.element(Svg).toHaveAttribute("width", "200");
  await expect.element(Svg).toHaveAttribute("height", "200");
});

test("should have path with QR code data", async () => {
  render(<Basic />);

  await expect.element(Path).toBeVisible();
  await expect.element(Path).toHaveAttribute("d");
  await expect.element(Path).toHaveAttribute("fill", "black");
});

test("overlay image should be present", async () => {
  render(<WithOverlay />);

  await expect.element(OverlayImg).toBeVisible();
  await expect.element(OverlayImg).toHaveAttribute("src");
  await expect.element(OverlayImg).toHaveAttribute("width");
  await expect.element(OverlayImg).toHaveAttribute("height");
});

test("should use the specified custom colors", async () => {
  render(<WithCustomColors />);

  await expect.element(Frame).toHaveStyle({ backgroundColor: "rgb(255, 255, 0)" });
  await expect.element(Path).toHaveAttribute("fill", "blue");
});

test("multiple QR codes should be visible and unique", async () => {
  render(<Multiple />);

  const allSvgs = page.getByTestId("svg");

  await expect.element(allSvgs.nth(0)).toBeVisible();
  await expect.element(allSvgs.nth(1)).toBeVisible();

  // Get the path data to verify they're different
  const firstPathElement = await allSvgs.nth(0).element();
  const secondPathElement = await allSvgs.nth(1).element();

  const firstPath = firstPathElement.querySelector("[data-testid='path']");
  const secondPath = secondPathElement.querySelector("[data-testid='path']");

  const firstD = firstPath?.getAttribute("d");
  const secondD = secondPath?.getAttribute("d");

  expect(firstD).toBeTruthy();
  expect(secondD).toBeTruthy();
  expect(firstD).not.toEqual(secondD);
});

test("should have proper ARIA attributes", async () => {
  render(<Basic />);

  await expect.element(Root).toHaveAttribute("role", "img");
  await expect.element(Root).toHaveAttribute("aria-label");
  await expect.element(Svg).toHaveAttribute("aria-hidden", "true");
});
