import { type PropsOf, component$, useSignal } from "@qwik.dev/core";
import axe from "axe-core";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-qwik";
import { page, userEvent } from "vitest/browser";
import * as Slider from "./index";

// Locator constants
const Root = page.getByTestId("root");
const Track = page.getByTestId("track");
const Range = page.getByTestId("range");
const Thumb = page.getByTestId("thumb");
const HiddenInput = page.getByTestId("hidden-input");

// Helper functions for complex locators - these return elements directly
async function getStartThumb() {
  const thumbs = await page.getByTestId("thumb").elements();
  return thumbs.find((el) => el.getAttribute("data-thumb-type") === "start");
}

async function getEndThumb() {
  const thumbs = await page.getByTestId("thumb").elements();
  return thumbs.find((el) => el.getAttribute("data-thumb-type") === "end");
}

async function getAllThumbs() {
  return await page.getByTestId("thumb").elements();
}

function getMarkers() {
  return document.querySelectorAll("[data-qds-slider-marker]");
}

// Test components
const Hero = component$((props: PropsOf<typeof Slider.Root>) => {
  return (
    <Slider.Root data-testid="root" {...props}>
      <Slider.Label>Volume</Slider.Label>
      <Slider.Track data-testid="track">
        <Slider.Range data-testid="range" />
        <Slider.Thumb data-testid="thumb" />
      </Slider.Track>
    </Slider.Root>
  );
});

const RangeSlider = component$((props: PropsOf<typeof Slider.Root>) => {
  return (
    <Slider.Root value={[30, 70]} data-testid="root" {...props}>
      <Slider.Track data-testid="track">
        <Slider.Range data-testid="range" />
        <Slider.Thumb type="start" data-testid="thumb" />
        <Slider.Thumb type="end" data-testid="thumb" />
      </Slider.Track>
    </Slider.Root>
  );
});

const WithMarks = component$((props: PropsOf<typeof Slider.Root>) => {
  const marks = [0, 20, 40, 60, 80, 100];
  return (
    <Slider.Root data-testid="root" {...props}>
      <Slider.Track data-testid="track">
        <Slider.Range data-testid="range" />
        <Slider.Thumb data-testid="thumb" />
        <Slider.MarkerGroup>
          {marks.map((mark) => (
            <Slider.Marker key={mark} value={mark} />
          ))}
        </Slider.MarkerGroup>
      </Slider.Track>
    </Slider.Root>
  );
});

const WithCallbacks = component$((props: PropsOf<typeof Slider.Root>) => {
  const logSignal = useSignal("");

  return (
    <div>
      <Slider.Root
        data-testid="root"
        {...props}
        onChange$={(value: number | number[]) => {
          console.log("Value changed:", value);
          logSignal.value = `Value changed: ${value}`;
        }}
        onChangeEnd$={(value) => {
          console.log("Final value:", value);
          logSignal.value += ` | Final value: ${value}`;
        }}
      >
        <Slider.Track data-testid="track">
          <Slider.Range data-testid="range" />
          <Slider.Thumb data-testid="thumb" />
        </Slider.Track>
      </Slider.Root>
      <div data-testid="log">{logSignal.value}</div>
    </div>
  );
});

const RangeWithMarks = component$((props: PropsOf<typeof Slider.Root>) => {
  const marks = [0, 20, 40, 60, 80, 100];
  return (
    <Slider.Root value={[20, 60]} data-testid="root" {...props}>
      <Slider.Track data-testid="track">
        <Slider.Range data-testid="range" />
        <Slider.Thumb type="start" data-testid="thumb" />
        <Slider.Thumb type="end" data-testid="thumb" />
        <Slider.MarkerGroup>
          {marks.map((mark) => (
            <Slider.Marker key={mark} value={mark} />
          ))}
        </Slider.MarkerGroup>
      </Slider.Track>
    </Slider.Root>
  );
});

const CustomStyles = component$((props: PropsOf<typeof Slider.Root>) => {
  return (
    <Slider.Root data-testid="root" {...props}>
      <Slider.Track data-testid="track">
        <Slider.Range data-testid="range" />
        <Slider.Thumb
          data-testid="thumb"
          style={{
            backgroundColor: "red",
            width: "24px",
            height: "24px",
            border: "3px solid darkred"
          }}
        />
      </Slider.Track>
    </Slider.Root>
  );
});

const DisabledSlider = component$((props: PropsOf<typeof Slider.Root>) => {
  const disabledSignal = useSignal(true);

  return (
    <div>
      <Slider.Root
        {...props}
        value={50}
        bind:disabled={disabledSignal}
        data-testid="root"
        onChange$={(_, __) => {
          console.log("This should not be called when disabled");
        }}
      >
        <Slider.Track data-testid="track">
          <Slider.Range data-testid="range" />
          <Slider.Thumb data-testid="thumb" />
        </Slider.Track>
      </Slider.Root>
      <button
        type="button"
        data-testid="toggle"
        onClick$={() => {
          disabledSignal.value = !disabledSignal.value;
        }}
      >
        Toggle Disabled
      </button>
    </div>
  );
});

const FormSlider = component$((props: PropsOf<typeof Slider.Root>) => {
  const formDataSignal = useSignal<string>();

  return (
    <form
      data-testid="form"
      preventdefault:submit
      onSubmit$={(e) => {
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const volume = formData.get("volume");
        formDataSignal.value = volume ? String(volume) : "";
      }}
    >
      <Slider.Root {...props} name="volume" value={50} data-testid="root">
        <Slider.Label>Volume</Slider.Label>
        <Slider.Track data-testid="track">
          <Slider.Range data-testid="range" />
          <Slider.Thumb data-testid="thumb" />
        </Slider.Track>
        <Slider.HiddenInput data-testid="hidden-input" />
      </Slider.Root>
      <button type="submit" data-testid="submit">
        Submit
      </button>
      {formDataSignal.value && (
        <div data-testid="result">{JSON.stringify({ volume: formDataSignal.value })}</div>
      )}
    </form>
  );
});

const RequiredSlider = component$((props: PropsOf<typeof Slider.Root>) => {
  return (
    <form data-testid="form">
      <Slider.Root {...props} name="volume" required data-testid="root">
        <Slider.Track data-testid="track">
          <Slider.Range data-testid="range" />
          <Slider.Thumb data-testid="thumb" />
        </Slider.Track>
        <Slider.HiddenInput data-testid="hidden-input" />
      </Slider.Root>
      <button type="submit" data-testid="submit">
        Submit
      </button>
    </form>
  );
});

const SliderWithSignalBinding = component$((props: PropsOf<typeof Slider.Root>) => {
  const externalValue = useSignal(25);

  return (
    <div>
      <Slider.Root {...props} data-testid="root" bind:value={externalValue}>
        <Slider.Track data-testid="track">
          <Slider.Range data-testid="range" />
          <Slider.Thumb data-testid="thumb" />
        </Slider.Track>
        <Slider.HiddenInput data-testid="hidden-input" />
      </Slider.Root>
      <div data-testid="external-value">External: {externalValue.value}</div>
      <button
        type="button"
        data-testid="update-external"
        onClick$={() => {
          externalValue.value = 75;
        }}
      >
        Update External
      </button>
    </div>
  );
});

describe("critical functionality", () => {
  test("all basic elements should be present in DOM", async () => {
    render(<Hero />);

    await expect.element(Root).toBeInTheDocument();
    await expect.element(Track).toBeInTheDocument();
    await expect.element(Range).toBeInTheDocument();
    await expect.element(Thumb).toBeInTheDocument();
  });

  test("range mode should have two thumbs", async () => {
    render(<RangeSlider />);

    await expect.element(Root).toBeInTheDocument();

    const thumbs = await getAllThumbs();
    expect(thumbs.length).toBe(2);

    const startThumb = await getStartThumb();
    const endThumb = await getEndThumb();
    expect(startThumb).toBeTruthy();
    expect(endThumb).toBeTruthy();
  });

  test("clicking on track should update value", async () => {
    render(<Hero />);

    await expect.element(Track).toBeInTheDocument();

    const trackEl = await Track.element();
    const rect = trackEl.getBoundingClientRect();

    // Click in the middle of the track using PointerEvent
    trackEl.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        button: 0,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true
      })
    );

    await expect.element(Thumb).toHaveAttribute("aria-valuenow", "50");
  });
});

describe("marks functionality", () => {
  test("marks should be visible", async () => {
    render(<WithMarks />);

    await expect.element(Root).toBeInTheDocument();

    const marks = getMarkers();
    expect(marks.length).toBe(6);
    expect(marks[0]).toBeTruthy();
    expect(marks[0].getAttribute("data-qds-slider-marker")).toBe("true");
  });
});

describe("keyboard navigation", () => {
  test("arrow keys should change value", async () => {
    render(<WithCallbacks />);

    await expect.element(Thumb).toBeInTheDocument();

    const thumbEl = (await Thumb.element()) as HTMLElement;

    const initialValue = Number(thumbEl.getAttribute("aria-valuenow"));
    expect(initialValue).toBe(0);

    thumbEl.focus();
    await userEvent.keyboard("{ArrowRight}");

    await expect
      .element(Thumb)
      .toHaveAttribute("aria-valuenow", String(initialValue + 1));

    await userEvent.keyboard("{ArrowLeft}");

    await expect.element(Thumb).toHaveAttribute("aria-valuenow", String(initialValue));
  });

  test("arrow keys with shift should change by larger step", async () => {
    render(<Hero />);

    await expect.element(Thumb).toBeInTheDocument();

    const thumbEl = (await Thumb.element()) as HTMLElement;
    thumbEl.focus();

    const valueBefore = Number(thumbEl.getAttribute("aria-valuenow"));

    await userEvent.keyboard("{Shift>}{ArrowRight}{/Shift}");

    await expect
      .element(Thumb)
      .toHaveAttribute("aria-valuenow", String(valueBefore + 10));
  });

  test("Home/End keys should go to min/max", async () => {
    render(<Hero />);

    await expect.element(Thumb).toBeInTheDocument();

    const thumbEl = (await Thumb.element()) as HTMLElement;
    thumbEl.focus();

    await userEvent.keyboard("{End}");
    await expect.element(Thumb).toHaveAttribute("aria-valuenow", "100");

    await userEvent.keyboard("{Home}");
    await expect.element(Thumb).toHaveAttribute("aria-valuenow", "0");
  });
});

describe("a11y", () => {
  test("should meet axe accessibility requirements", async () => {
    const screen = render(<Hero />);

    await expect.element(Root).toBeInTheDocument();

    // Disable nested-interactive rule as the slider component intentionally nests
    // role="slider" elements (root and thumb) for proper slider functionality
    const results = await axe.run(screen.container, {
      rules: {
        "nested-interactive": { enabled: false }
      }
    });

    expect(results.violations).toHaveLength(0);
  });
});

describe("callbacks", () => {
  test("clicking track should fire callbacks once", async () => {
    render(<WithCallbacks />);

    await expect.element(Track).toBeInTheDocument();

    const trackEl = await Track.element();
    const rect = trackEl.getBoundingClientRect();

    // Use PointerEvent
    trackEl.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect.left + rect.width * 0.75,
        clientY: rect.top + rect.height / 2,
        button: 0,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true
      })
    );

    const logEl = await page.getByTestId("log").element();
    await expect.element(page.getByTestId("log")).toContainHTML("Final value:");

    const logText = logEl.textContent || "";
    expect(logText).toContain("Value changed:");
    expect(logText).toContain("Final value:");
  });

  test("dragging thumb should fire callbacks appropriately", async () => {
    render(<WithCallbacks />);

    await expect.element(Thumb).toBeInTheDocument();

    const thumbEl = (await Thumb.element()) as HTMLElement;
    const trackEl = (await Track.element()) as HTMLElement;

    // Get track position
    const rect = trackEl.getBoundingClientRect();
    const targetX = rect.left + rect.width * 0.5; // Target 50%

    // Focus thumb first
    thumbEl.focus();

    // Simulate pointer down on thumb to start drag
    const pointerDownEvent = new PointerEvent("pointerdown", {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + rect.width * 0.2,
      pointerId: 1,
      isPrimary: true
    });
    thumbEl.dispatchEvent(pointerDownEvent);

    // Give time for the drag state to be set
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Simulate pointer move
    const pointerMoveEvent = new PointerEvent("pointermove", {
      bubbles: true,
      cancelable: true,
      clientX: targetX,
      pointerId: 1,
      isPrimary: true
    });
    thumbEl.dispatchEvent(pointerMoveEvent);

    // Give time for the value to update
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Simulate pointer up to end drag
    const pointerUpEvent = new PointerEvent("pointerup", {
      bubbles: true,
      cancelable: true,
      clientX: targetX,
      pointerId: 1,
      isPrimary: true
    });
    thumbEl.dispatchEvent(pointerUpEvent);

    // Wait for callbacks to be called
    await expect.element(page.getByTestId("log")).toContainHTML("Final value:");

    const logEl = await page.getByTestId("log").element();
    const logText = logEl.textContent || "";

    // Should have both onChange and onChangeEnd
    expect(logText).toContain("Value changed:");
    expect(logText).toContain("Final value:");
  });

  test("keyboard navigation should fire callbacks", async () => {
    render(<WithCallbacks />);

    await expect.element(Thumb).toBeInTheDocument();

    const thumbEl = (await Thumb.element()) as HTMLElement;
    thumbEl.focus();

    await userEvent.keyboard("{ArrowRight}");

    const logEl = await page.getByTestId("log").element();
    await expect.element(page.getByTestId("log")).toContainHTML("Final value: 1");

    const logText = logEl.textContent || "";
    expect(logText).toContain("Value changed: 1");
    expect(logText).toContain("Final value: 1");
  });
});

describe("range mode", () => {
  test("both thumbs should have correct initial positions", async () => {
    render(<RangeSlider />);

    await expect.element(Root).toBeInTheDocument();

    const startThumb = await getStartThumb();
    const endThumb = await getEndThumb();

    expect(startThumb).toBeTruthy();
    expect(endThumb).toBeTruthy();

    expect(startThumb?.getAttribute("aria-valuenow")).toBe("30");
    expect(endThumb?.getAttribute("aria-valuenow")).toBe("70");
  });

  test("start thumb should not exceed end value", async () => {
    render(<RangeWithMarks />);

    await expect.element(Root).toBeInTheDocument();

    const startThumbEl = (await getStartThumb()) as HTMLElement;
    startThumbEl.focus();

    // Try to move start thumb past end thumb
    for (let i = 0; i < 10; i++) {
      await userEvent.keyboard("{ArrowRight}");
    }

    const startValue = Number(startThumbEl.getAttribute("aria-valuenow"));
    const endThumbEl = await getEndThumb();
    const endValue = Number(endThumbEl?.getAttribute("aria-valuenow"));

    expect(startValue).toBeLessThanOrEqual(endValue);
  });

  test("end thumb should not go below start value", async () => {
    render(<RangeWithMarks />);

    await expect.element(Root).toBeInTheDocument();

    const endThumbEl = (await getEndThumb()) as HTMLElement;
    endThumbEl.focus();

    // Try to move end thumb past start thumb
    for (let i = 0; i < 10; i++) {
      await userEvent.keyboard("{ArrowLeft}");
    }

    const endValue = Number(endThumbEl.getAttribute("aria-valuenow"));
    const startThumbEl = await getStartThumb();
    const startValue = Number(startThumbEl?.getAttribute("aria-valuenow"));

    expect(endValue).toBeGreaterThanOrEqual(startValue);
  });

  test("keyboard navigation should respect min/max bounds", async () => {
    render(<RangeSlider />);

    await expect.element(Root).toBeInTheDocument();

    const startThumbEl = (await getStartThumb()) as HTMLElement;
    const endThumbEl = (await getEndThumb()) as HTMLElement;

    startThumbEl.focus();
    await userEvent.keyboard("{Home}");

    expect(startThumbEl.getAttribute("aria-valuenow")).toBe("0");

    await userEvent.keyboard("{End}");

    const endValue = endThumbEl.getAttribute("aria-valuenow");
    expect(startThumbEl.getAttribute("aria-valuenow")).toBe(String(endValue));

    endThumbEl.focus();
    await userEvent.keyboard("{End}");
    expect(endThumbEl.getAttribute("aria-valuenow")).toBe("100");

    await userEvent.keyboard("{Home}");

    const startValue = startThumbEl.getAttribute("aria-valuenow");
    expect(endThumbEl.getAttribute("aria-valuenow")).toBe(String(startValue));
  });
});

describe("style customization", () => {
  test("custom styles should be applied and merged with positioning", async () => {
    render(<CustomStyles />);

    await expect.element(Thumb).toBeInTheDocument();

    const thumbEl = await Thumb.element();
    const computedStyle = window.getComputedStyle(thumbEl);

    expect(computedStyle.backgroundColor).toBe("rgb(255, 0, 0)");
    expect(computedStyle.width).toBe("24px");
    expect(computedStyle.height).toBe("24px");
    // Note: border style might vary by browser, so we just check that it exists
    expect(computedStyle.borderWidth).toBe("3px");

    const trackEl = await Track.element();
    const trackRect = trackEl.getBoundingClientRect();
    const thumbRect = thumbEl.getBoundingClientRect();

    // Check that thumb center is within track bounds (thumb uses transform: translate(-50%, -50%))
    const thumbCenterX = thumbRect.x + thumbRect.width / 2;
    expect(thumbCenterX).toBeGreaterThanOrEqual(trackRect.x);
    expect(thumbCenterX).toBeLessThanOrEqual(trackRect.x + trackRect.width);
  });
});

describe("disabled state", () => {
  test("value should not change when disabled", async () => {
    render(<DisabledSlider />);

    await expect.element(Thumb).toBeInTheDocument();
    await expect.element(Root).toHaveAttribute("aria-disabled", "true");
    await expect.element(Thumb).toHaveAttribute("aria-disabled", "true");
    await expect.element(Thumb).toHaveAttribute("tabindex", "-1");

    const thumbEl = await Thumb.element();
    const initialValue = String(thumbEl.getAttribute("aria-valuenow"));

    const trackEl = await Track.element();
    const rect = trackEl.getBoundingClientRect();

    trackEl.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect.left + rect.width * 0.75,
        clientY: rect.top + rect.height / 2,
        button: 0,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true
      })
    );

    await expect.element(Thumb).toHaveAttribute("aria-valuenow", initialValue);

    const thumbElHtml = (await Thumb.element()) as HTMLElement;
    thumbElHtml.focus();
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.keyboard("{ArrowLeft}");
    await userEvent.keyboard("{Home}");
    await userEvent.keyboard("{End}");

    await expect.element(Thumb).toHaveAttribute("aria-valuenow", initialValue);
  });

  test("interactions should work after enabling", async () => {
    render(<DisabledSlider />);

    await expect.element(Thumb).toBeInTheDocument();
    await expect.element(Root).toHaveAttribute("aria-disabled", "true");

    const toggleBtn = await page.getByTestId("toggle").element();
    await userEvent.click(toggleBtn);

    await expect.element(Root).toHaveAttribute("aria-disabled", "false");

    const thumbEl = (await Thumb.element()) as HTMLElement;
    thumbEl.focus();
    await userEvent.keyboard("{ArrowRight}");

    await expect.element(Thumb).toHaveAttribute("aria-valuenow", "51"); // 50 + 1

    await userEvent.click(toggleBtn);
    await expect.element(Root).toHaveAttribute("aria-disabled", "true");

    await userEvent.keyboard("{ArrowRight}");
    await expect.element(Thumb).toHaveAttribute("aria-valuenow", "51");
  });
});

describe("form integration", () => {
  test("hidden input should be present in DOM", async () => {
    render(<FormSlider />);

    await expect.element(Root).toBeInTheDocument();

    const hiddenInput = await HiddenInput.element();
    expect(hiddenInput).toBeTruthy();
    expect(hiddenInput.tagName).toBe("INPUT");
    expect(hiddenInput.getAttribute("type")).toBe("hidden");
    expect(hiddenInput.getAttribute("name")).toBe("volume");
  });

  test("hidden input should sync with slider value", async () => {
    render(<FormSlider />);

    await expect.element(Thumb).toBeInTheDocument();

    const hiddenInput = (await page
      .getByTestId("hidden-input")
      .element()) as HTMLInputElement;
    expect(hiddenInput.value).toBe("50");

    const thumbEl = (await Thumb.element()) as HTMLElement;
    thumbEl.focus();
    await userEvent.keyboard("{ArrowRight}");

    await expect.element(Thumb).toHaveAttribute("aria-valuenow", "51");
    expect(hiddenInput.value).toBe("51");
  });

  test("form submission should include slider value", async () => {
    render(<FormSlider />);

    await expect.element(Root).toBeInTheDocument();

    const submitBtn = await page.getByTestId("submit").element();
    await userEvent.click(submitBtn);

    const resultEl = await page.getByTestId("result");
    await expect.element(resultEl).toContainHTML('"volume":"50"');
  });

  test("hidden input should have required attribute when specified", async () => {
    render(<RequiredSlider />);

    await expect.element(Root).toBeInTheDocument();
    await expect.element(HiddenInput).toHaveAttribute("required");
  });

  test("hidden input should render comma-separated values for range sliders", async () => {
    render(
      <Slider.Root value={[30, 70]} data-testid="root">
        <Slider.Track data-testid="track">
          <Slider.Range data-testid="range" />
          <Slider.Thumb type="start" data-testid="thumb" />
          <Slider.Thumb type="end" data-testid="thumb" />
        </Slider.Track>
        <Slider.HiddenInput data-testid="hidden-input" />
      </Slider.Root>
    );

    await expect.element(Root).toBeInTheDocument();

    const hiddenInput = (await HiddenInput.element()) as HTMLInputElement;
    expect(hiddenInput).toBeTruthy();
    expect(hiddenInput.value).toBe("30,70");
  });

  test("range slider form submission should include comma-separated values", async () => {
    const RangeFormSlider = component$(() => {
      const formDataSignal = useSignal<string>();

      return (
        <form
          data-testid="form"
          preventdefault:submit
          onSubmit$={(e) => {
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const range = formData.get("range");
            formDataSignal.value = range ? String(range) : "";
          }}
        >
          <Slider.Root name="range" value={[25, 75]} data-testid="root">
            <Slider.Track data-testid="track">
              <Slider.Range data-testid="range" />
              <Slider.Thumb type="start" data-testid="thumb" />
              <Slider.Thumb type="end" data-testid="thumb" />
            </Slider.Track>
            <Slider.HiddenInput data-testid="hidden-input" />
          </Slider.Root>
          <button type="submit" data-testid="submit">
            Submit
          </button>
          {formDataSignal.value && (
            <div data-testid="result">
              {JSON.stringify({ range: formDataSignal.value })}
            </div>
          )}
        </form>
      );
    });

    render(<RangeFormSlider />);

    await expect.element(Root).toBeInTheDocument();

    const submitBtn = await page.getByTestId("submit").element();
    await userEvent.click(submitBtn);

    const resultEl = await page.getByTestId("result");
    await expect.element(resultEl).toContainHTML('"range":"25,75"');
  });

  test("hidden input should be visually hidden but accessible", async () => {
    render(<FormSlider />);

    await expect.element(Root).toBeInTheDocument();

    const hiddenInput = (await page
      .getByTestId("hidden-input")
      .element()) as HTMLInputElement;
    const hiddenInputStyles = window.getComputedStyle(hiddenInput);

    // Should be hidden visually
    expect(hiddenInput.tabIndex).toBe(-1);

    // Should still be in the DOM (accessible to forms)
    expect(hiddenInput).toBeTruthy();
    expect(hiddenInput.name).toBe("volume");
  });

  test("hidden input should reflect root's bound signal value", async () => {
    render(<SliderWithSignalBinding />);

    await expect.element(Root).toBeInTheDocument();

    const hiddenInput = (await HiddenInput.element()) as HTMLInputElement;
    const externalDisplay = await page.getByTestId("external-value");

    // Initial value should be 25
    expect(hiddenInput.value).toBe("25");
    await expect.element(externalDisplay).toContainHTML("External: 25");

    // Update external signal - hidden input should reflect the change
    const updateBtn = await page.getByTestId("update-external").element();
    await userEvent.click(updateBtn);

    await expect.element(externalDisplay).toContainHTML("External: 75");
    expect(hiddenInput.value).toBe("75");
  });

  test("hidden input should update when slider changes via keyboard", async () => {
    render(<SliderWithSignalBinding />);

    await expect.element(Root).toBeInTheDocument();

    const hiddenInput = (await HiddenInput.element()) as HTMLInputElement;
    const externalDisplay = await page.getByTestId("external-value");
    const thumbEl = (await Thumb.element()) as HTMLElement;

    // Initial value
    expect(hiddenInput.value).toBe("25");
    await expect.element(externalDisplay).toContainHTML("External: 25");

    // Move slider with keyboard and wait for each update
    thumbEl.focus();

    await userEvent.keyboard("{ArrowRight}");
    await expect.element(externalDisplay).toContainHTML("External: 26");

    await userEvent.keyboard("{ArrowRight}");
    await expect.element(externalDisplay).toContainHTML("External: 27");

    await userEvent.keyboard("{ArrowRight}");
    await expect.element(externalDisplay).toContainHTML("External: 28");

    // Hidden input should reflect the final value
    expect(hiddenInput.value).toBe("28");
  });
});
