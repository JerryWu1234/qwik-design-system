// oxlint-disable no-empty-file
// import { component$ } from "@qwik.dev/core";
// import { describe, expect, test } from "vitest";
// import { render } from "vitest-browser-qwik";
// import { page, userEvent } from "vitest/browser";
// import * as ScrollArea from "./index";

// // Locator constants
// const Root = page.getByTestId("root");
// const Viewport = page.getByTestId("viewport");
// const VerticalScrollbar = page.getByTestId("vertical-scrollbar");
// const HorizontalScrollbar = page.getByTestId("horizontal-scrollbar");
// const VerticalThumb = page.getByTestId("vertical-thumb");
// const HorizontalThumb = page.getByTestId("horizontal-thumb");

// // Test components
// const VerticalTest = component$(() => {
//   return (
//     <ScrollArea.Root
//       type="always"
//       data-testid="root"
//       style={{ width: "250px", height: "150px" }}
//     >
//       <ScrollArea.Viewport
//         data-testid="viewport"
//         aria-label="Scrollable content"
//         style={{ height: "100%" }}
//       >
//         <div style={{ height: "500px", padding: "20px" }}>
//           <div>Line 1</div>
//           <div>Line 2</div>
//           <div>Line 3</div>
//           <div>Line 4</div>
//           <div>Line 5</div>
//         </div>
//       </ScrollArea.Viewport>
//       <ScrollArea.Scrollbar orientation="vertical" data-testid="vertical-scrollbar">
//         <ScrollArea.Thumb data-testid="vertical-thumb" />
//       </ScrollArea.Scrollbar>
//     </ScrollArea.Root>
//   );
// });

// const HorizontalTest = component$(() => {
//   return (
//     <ScrollArea.Root
//       type="always"
//       data-testid="root"
//       style={{ width: "250px", height: "150px" }}
//     >
//       <ScrollArea.Viewport
//         data-testid="viewport"
//         aria-label="Scrollable content"
//         style={{ width: "100%", height: "100%" }}
//       >
//         <div style={{ width: "500px", padding: "20px" }}>
//           <div style={{ whiteSpace: "nowrap" }}>
//             Long horizontal content that exceeds viewport width
//           </div>
//         </div>
//       </ScrollArea.Viewport>
//       <ScrollArea.Scrollbar
//         orientation="horizontal"
//         data-testid="horizontal-scrollbar"
//         style={{ width: "100%", height: "12px" }}
//       >
//         <ScrollArea.Thumb
//           data-testid="horizontal-thumb"
//           style={{ width: "50px", height: "8px" }}
//         />
//       </ScrollArea.Scrollbar>
//     </ScrollArea.Root>
//   );
// });

// const BothTest = component$(() => {
//   return (
//     <ScrollArea.Root
//       type="always"
//       data-testid="root"
//       style={{ width: "250px", height: "150px" }}
//     >
//       <ScrollArea.Viewport
//         data-testid="viewport"
//         aria-label="Scrollable content"
//         style={{ width: "100%", height: "100%" }}
//       >
//         <div style={{ width: "500px", height: "500px", padding: "20px" }}>
//           <div>Content that overflows both vertically and horizontally</div>
//         </div>
//       </ScrollArea.Viewport>
//       <ScrollArea.Scrollbar
//         orientation="vertical"
//         data-testid="vertical-scrollbar"
//         style={{ width: "12px", height: "100%" }}
//       >
//         <ScrollArea.Thumb
//           data-testid="vertical-thumb"
//           style={{ width: "8px", height: "50px" }}
//         />
//       </ScrollArea.Scrollbar>
//       <ScrollArea.Scrollbar
//         orientation="horizontal"
//         data-testid="horizontal-scrollbar"
//         style={{ width: "100%", height: "12px" }}
//       >
//         <ScrollArea.Thumb
//           data-testid="horizontal-thumb"
//           style={{ width: "50px", height: "8px" }}
//         />
//       </ScrollArea.Scrollbar>
//     </ScrollArea.Root>
//   );
// });

// const AutoTest = component$(() => {
//   return (
//     <ScrollArea.Root
//       type="auto"
//       data-testid="root"
//       style={{ width: "250px", height: "150px" }}
//     >
//       <ScrollArea.Viewport
//         data-testid="viewport"
//         aria-label="Scrollable content"
//         style={{ height: "100%" }}
//       >
//         <div style={{ height: "500px", padding: "20px" }}>
//           <div>Line 1</div>
//           <div>Line 2</div>
//         </div>
//       </ScrollArea.Viewport>
//       <ScrollArea.Scrollbar orientation="vertical" data-testid="vertical-scrollbar">
//         <ScrollArea.Thumb data-testid="vertical-thumb" />
//       </ScrollArea.Scrollbar>
//     </ScrollArea.Root>
//   );
// });

// const AutoNoOverflowTest = component$(() => {
//   return (
//     <ScrollArea.Root
//       type="auto"
//       data-testid="root"
//       style={{ width: "250px", height: "150px" }}
//     >
//       <ScrollArea.Viewport
//         data-testid="viewport"
//         aria-label="Scrollable content"
//         style={{ height: "100%" }}
//       >
//         <div style={{ height: "50px", padding: "20px" }}>
//           <div>Short content</div>
//         </div>
//       </ScrollArea.Viewport>
//       <ScrollArea.Scrollbar orientation="vertical" data-testid="vertical-scrollbar">
//         <ScrollArea.Thumb data-testid="vertical-thumb" />
//       </ScrollArea.Scrollbar>
//     </ScrollArea.Root>
//   );
// });

// const HoverTest = component$(() => {
//   return (
//     <ScrollArea.Root
//       type="hover"
//       data-testid="root"
//       style={{ width: "250px", height: "150px" }}
//     >
//       <ScrollArea.Viewport
//         data-testid="viewport"
//         aria-label="Scrollable content"
//         style={{ height: "100%" }}
//       >
//         <div style={{ height: "500px", padding: "20px" }}>
//           <div>Line 1</div>
//           <div>Line 2</div>
//         </div>
//       </ScrollArea.Viewport>
//       <ScrollArea.Scrollbar orientation="vertical" data-testid="vertical-scrollbar">
//         <ScrollArea.Thumb data-testid="vertical-thumb" />
//       </ScrollArea.Scrollbar>
//     </ScrollArea.Root>
//   );
// });

// const HoverNoOverflowTest = component$(() => {
//   return (
//     <ScrollArea.Root
//       type="hover"
//       data-testid="root"
//       style={{ width: "250px", height: "150px" }}
//     >
//       <ScrollArea.Viewport
//         data-testid="viewport"
//         aria-label="Scrollable content"
//         style={{ height: "100%" }}
//       >
//         <div style={{ height: "50px", padding: "20px" }}>
//           <div>Short content</div>
//         </div>
//       </ScrollArea.Viewport>
//       <ScrollArea.Scrollbar orientation="vertical" data-testid="vertical-scrollbar">
//         <ScrollArea.Thumb data-testid="vertical-thumb" />
//       </ScrollArea.Scrollbar>
//     </ScrollArea.Root>
//   );
// });

// const ScrollTest = component$(() => {
//   return (
//     <ScrollArea.Root
//       type="scroll"
//       data-testid="root"
//       style={{ width: "250px", height: "150px" }}
//     >
//       <ScrollArea.Viewport
//         data-testid="viewport"
//         aria-label="Scrollable content"
//         style={{ height: "100%" }}
//       >
//         <div style={{ height: "500px", padding: "20px" }}>
//           <div>Line 1</div>
//           <div>Line 2</div>
//         </div>
//       </ScrollArea.Viewport>
//       <ScrollArea.Scrollbar orientation="vertical" data-testid="vertical-scrollbar">
//         <ScrollArea.Thumb data-testid="vertical-thumb" />
//       </ScrollArea.Scrollbar>
//     </ScrollArea.Root>
//   );
// });

// const AlwaysTest = component$(() => {
//   return (
//     <ScrollArea.Root
//       type="always"
//       data-testid="root"
//       style={{ width: "250px", height: "150px" }}
//     >
//       <ScrollArea.Viewport
//         data-testid="viewport"
//         aria-label="Scrollable content"
//         style={{ height: "100%" }}
//       >
//         <div style={{ height: "500px", padding: "20px" }}>
//           <div>Line 1</div>
//           <div>Line 2</div>
//         </div>
//       </ScrollArea.Viewport>
//       <ScrollArea.Scrollbar orientation="vertical" data-testid="vertical-scrollbar">
//         <ScrollArea.Thumb data-testid="vertical-thumb" />
//       </ScrollArea.Scrollbar>
//     </ScrollArea.Root>
//   );
// });

// const AlwaysNoOverflowTest = component$(() => {
//   return (
//     <ScrollArea.Root
//       type="always"
//       data-testid="root"
//       style={{ width: "250px", height: "150px" }}
//     >
//       <ScrollArea.Viewport
//         data-testid="viewport"
//         aria-label="Scrollable content"
//         style={{ height: "100%" }}
//       >
//         <div style={{ height: "50px", padding: "20px" }}>
//           <div>Short content</div>
//         </div>
//       </ScrollArea.Viewport>
//       <ScrollArea.Scrollbar orientation="vertical" data-testid="vertical-scrollbar">
//         <ScrollArea.Thumb data-testid="vertical-thumb" />
//       </ScrollArea.Scrollbar>
//     </ScrollArea.Root>
//   );
// });

// const CustomDelayTest = component$(() => {
//   return (
//     <ScrollArea.Root
//       type="scroll"
//       hideDelay={1000}
//       data-testid="root"
//       style={{ width: "250px", height: "150px" }}
//     >
//       <ScrollArea.Viewport
//         data-testid="viewport"
//         aria-label="Scrollable content"
//         style={{ height: "100%" }}
//       >
//         <div style={{ height: "500px", padding: "20px" }}>
//           <div>Line 1</div>
//           <div>Line 2</div>
//         </div>
//       </ScrollArea.Viewport>
//       <ScrollArea.Scrollbar orientation="vertical" data-testid="vertical-scrollbar">
//         <ScrollArea.Thumb data-testid="vertical-thumb" />
//       </ScrollArea.Scrollbar>
//     </ScrollArea.Root>
//   );
// });

// // Helper function to drag a thumb
// async function dragThumb(
//   thumb: typeof VerticalThumb | typeof HorizontalThumb,
//   dx: number,
//   dy: number
// ) {
//   const element = await thumb.element();
//   const rect = element.getBoundingClientRect();

//   const startX = rect.left + rect.width / 2;
//   const startY = rect.top + rect.height / 2;
//   const endX = startX + dx;
//   const endY = startY + dy;

//   // Dispatch mousedown
//   element.dispatchEvent(
//     new MouseEvent("mousedown", {
//       bubbles: true,
//       cancelable: true,
//       view: window,
//       clientX: startX,
//       clientY: startY,
//       screenX: startX,
//       screenY: startY,
//       button: 0,
//       buttons: 1
//     })
//   );

//   // Dispatch multiple mousemove events for smooth drag
//   const steps = 10;
//   for (let i = 1; i <= steps; i++) {
//     const currentX = startX + (dx * i) / steps;
//     const currentY = startY + (dy * i) / steps;

//     document.dispatchEvent(
//       new MouseEvent("mousemove", {
//         bubbles: true,
//         cancelable: true,
//         view: window,
//         clientX: currentX,
//         clientY: currentY,
//         screenX: currentX,
//         screenY: currentY,
//         button: 0,
//         buttons: 1
//       })
//     );
//     // Small delay for event processing
//     await new Promise((resolve) => setTimeout(resolve, 5));
//   }

//   // Dispatch mouseup
//   document.dispatchEvent(
//     new MouseEvent("mouseup", {
//       bubbles: true,
//       cancelable: true,
//       view: window,
//       clientX: endX,
//       clientY: endY,
//       screenX: endX,
//       screenY: endY,
//       button: 0,
//       buttons: 0
//     })
//   );

//   // Allow time for scroll position to update
//   await new Promise((resolve) => setTimeout(resolve, 10));
// }

// describe("critical functionality", () => {
//   test("vertical scrollbar should be visible when content exceeds viewport height", async () => {
//     render(<VerticalTest />);

//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "visible");
//   });

//   test("horizontal scrollbar should be visible when content exceeds viewport width", async () => {
//     render(<HorizontalTest />);

//     await expect.element(HorizontalScrollbar).toBeInTheDocument();

//     const viewportEl = await Viewport.element();

//     // Manually trigger overflow check
//     viewportEl.dispatchEvent(new CustomEvent("qdsoverflowcheck"));

//     await expect.element(HorizontalScrollbar).toHaveAttribute("data-state", "visible");
//   });

//   test("thumb should move to bottom position when scrolling to bottom", async () => {
//     render(<VerticalTest />);

//     await expect.element(VerticalThumb).toBeInTheDocument();

//     const viewportEl = await Viewport.element();

//     // Scroll to bottom and dispatch scroll event
//     viewportEl.scrollTop = viewportEl.scrollHeight;
//     viewportEl.dispatchEvent(new Event("scroll", { bubbles: true }));

//     // Minimal delay for browser to process scroll event and update thumb position
//     await new Promise((resolve) => setTimeout(resolve, 10));

//     const thumbEl = await VerticalThumb.element();
//     const scrollbarEl = await VerticalScrollbar.element();

//     const thumbRect = thumbEl.getBoundingClientRect();
//     const scrollbarRect = scrollbarEl.getBoundingClientRect();

//     const expectedBottom = scrollbarRect.y + scrollbarRect.height;
//     const actualBottom = thumbRect.y + thumbRect.height - 2; // 2px for padding

//     // Allow 5px tolerance for positioning variations
//     expect(Math.abs(actualBottom - expectedBottom)).toBeLessThanOrEqual(5);
//   });
// });

// describe("drag functionality", () => {
//   test("content should scroll when dragging the vertical thumb", async () => {
//     render(<VerticalTest />);

//     await expect.element(VerticalThumb).toBeInTheDocument();

//     const viewportEl = await Viewport.element();
//     const initialScrollTop = viewportEl.scrollTop;

//     await dragThumb(VerticalThumb, 0, 100);

//     const newScrollTop = viewportEl.scrollTop;
//     expect(newScrollTop).toBeGreaterThan(initialScrollTop);
//   });

//   test("content should scroll when dragging the horizontal thumb", async () => {
//     render(<HorizontalTest />);

//     await expect.element(HorizontalThumb).toBeInTheDocument();

//     const viewportEl = await Viewport.element();
//     const initialScrollLeft = viewportEl.scrollLeft;

//     await dragThumb(HorizontalThumb, 100, 0);

//     const newScrollLeft = viewportEl.scrollLeft;
//     expect(newScrollLeft).toBeGreaterThan(initialScrollLeft);
//   });

//   test("vertical thumb should move smoothly when dragged outside scrollbar bounds", async () => {
//     render(<BothTest />);

//     await expect.element(VerticalThumb).toBeInTheDocument();

//     const viewportEl = await Viewport.element();
//     const initialScrollTop = viewportEl.scrollTop;

//     const thumbEl = await VerticalThumb.element();
//     const scrollbarEl = await VerticalScrollbar.element();

//     const initialThumbRect = thumbEl.getBoundingClientRect();
//     const scrollbarRect = scrollbarEl.getBoundingClientRect();

//     await dragThumb(VerticalThumb, 100, 100); // Move far right and down

//     const newScrollTop = viewportEl.scrollTop;
//     const newThumbRect = thumbEl.getBoundingClientRect();

//     // Verify scroll position changed
//     expect(newScrollTop).toBeGreaterThan(initialScrollTop);

//     // Verify thumb stayed within scrollbar bounds
//     expect(newThumbRect.x).toBeCloseTo(initialThumbRect.x, 0); // X position shouldn't change
//     expect(newThumbRect.y).toBeGreaterThanOrEqual(scrollbarRect.y); // Should stay within top bound
//     expect(newThumbRect.y + newThumbRect.height).toBeLessThanOrEqual(
//       scrollbarRect.y + scrollbarRect.height
//     ); // Should stay within bottom bound
//   });

//   test("horizontal thumb should move smoothly when dragged outside scrollbar bounds", async () => {
//     render(<BothTest />);

//     await expect.element(HorizontalThumb).toBeInTheDocument();

//     const viewportEl = await Viewport.element();
//     const initialScrollLeft = viewportEl.scrollLeft;

//     const thumbEl = await HorizontalThumb.element();
//     const scrollbarEl = await HorizontalScrollbar.element();

//     const initialThumbRect = thumbEl.getBoundingClientRect();
//     const scrollbarRect = scrollbarEl.getBoundingClientRect();

//     await dragThumb(HorizontalThumb, 100, 100); // Move right and far down

//     const newScrollLeft = viewportEl.scrollLeft;
//     const newThumbRect = thumbEl.getBoundingClientRect();

//     // Verify scroll position changed
//     expect(newScrollLeft).toBeGreaterThan(initialScrollLeft);

//     // Verify thumb stayed within scrollbar bounds
//     const tolerance = 2;
//     expect(Math.abs(newThumbRect.y - initialThumbRect.y)).toBeLessThanOrEqual(tolerance);
//     expect(newThumbRect.x).toBeGreaterThanOrEqual(scrollbarRect.x - tolerance);
//     expect(newThumbRect.x + newThumbRect.width).toBeLessThanOrEqual(
//       scrollbarRect.x + scrollbarRect.width + tolerance
//     );
//   });

//   test("thumb should maintain drag state when dragging is active", async () => {
//     render(<BothTest />);

//     await expect.element(VerticalThumb).toBeInTheDocument();

//     // Test vertical thumb
//     const verticalThumbEl = await VerticalThumb.element();
//     const verticalThumbRect = verticalThumbEl.getBoundingClientRect();

//     const startX = verticalThumbRect.left + verticalThumbRect.width / 2;
//     const startY = verticalThumbRect.top + verticalThumbRect.height / 2;

//     verticalThumbEl.dispatchEvent(
//       new MouseEvent("mousedown", {
//         bubbles: true,
//         cancelable: true,
//         view: window,
//         clientX: startX,
//         clientY: startY,
//         screenX: startX,
//         screenY: startY,
//         button: 0,
//         buttons: 1
//       })
//     );

//     // Move outside bounds
//     document.dispatchEvent(
//       new MouseEvent("mousemove", {
//         bubbles: true,
//         cancelable: true,
//         view: window,
//         clientX: startX + 100,
//         clientY: startY + 100,
//         screenX: startX + 100,
//         screenY: startY + 100,
//         button: 0,
//         buttons: 1
//       })
//     );

//     await expect.element(VerticalThumb).toHaveAttribute("data-dragging", "");

//     document.dispatchEvent(
//       new MouseEvent("mouseup", {
//         bubbles: true,
//         cancelable: true,
//         view: window,
//         clientX: startX + 100,
//         clientY: startY + 100,
//         screenX: startX + 100,
//         screenY: startY + 100,
//         button: 0,
//         buttons: 0
//       })
//     );

//     // Test horizontal thumb
//     const horizontalThumbEl = await HorizontalThumb.element();
//     const horizontalThumbRect = horizontalThumbEl.getBoundingClientRect();

//     const startX2 = horizontalThumbRect.left + horizontalThumbRect.width / 2;
//     const startY2 = horizontalThumbRect.top + horizontalThumbRect.height / 2;

//     horizontalThumbEl.dispatchEvent(
//       new MouseEvent("mousedown", {
//         bubbles: true,
//         cancelable: true,
//         view: window,
//         clientX: startX2,
//         clientY: startY2,
//         screenX: startX2,
//         screenY: startY2,
//         button: 0,
//         buttons: 1
//       })
//     );

//     document.dispatchEvent(
//       new MouseEvent("mousemove", {
//         bubbles: true,
//         cancelable: true,
//         view: window,
//         clientX: startX2 + 100,
//         clientY: startY2 + 100,
//         screenX: startX2 + 100,
//         screenY: startY2 + 100,
//         button: 0,
//         buttons: 1
//       })
//     );

//     await expect.element(HorizontalThumb).toHaveAttribute("data-dragging", "");

//     document.dispatchEvent(
//       new MouseEvent("mouseup", {
//         bubbles: true,
//         cancelable: true,
//         view: window,
//         clientX: startX2 + 100,
//         clientY: startY2 + 100,
//         screenX: startX2 + 100,
//         screenY: startY2 + 100,
//         button: 0,
//         buttons: 0
//       })
//     );
//   });
// });

// describe("thumb behavior", () => {
//   test("thumb should have dragging state when being dragged", async () => {
//     render(<VerticalTest />);

//     await expect.element(VerticalThumb).toBeInTheDocument();

//     const thumbEl = await VerticalThumb.element();
//     const thumbRect = thumbEl.getBoundingClientRect();

//     const centerX = thumbRect.left + thumbRect.width / 2;
//     const centerY = thumbRect.top + thumbRect.height / 2;

//     thumbEl.dispatchEvent(
//       new MouseEvent("mousedown", {
//         bubbles: true,
//         cancelable: true,
//         view: window,
//         clientX: centerX,
//         clientY: centerY,
//         screenX: centerX,
//         screenY: centerY,
//         button: 0,
//         buttons: 1
//       })
//     );

//     await expect.element(VerticalThumb).toHaveAttribute("data-dragging", "");

//     document.dispatchEvent(
//       new MouseEvent("mouseup", {
//         bubbles: true,
//         cancelable: true,
//         view: window,
//         clientX: centerX,
//         clientY: centerY,
//         screenX: centerX,
//         screenY: centerY,
//         button: 0,
//         buttons: 0
//       })
//     );
//   });

//   test("viewport should scroll when clicking on scrollbar track", async () => {
//     render(<VerticalTest />);

//     await expect.element(VerticalScrollbar).toBeInTheDocument();

//     // Manually trigger overflow check to ensure scrollbar is visible
//     const viewportEl = await Viewport.element();
//     viewportEl.dispatchEvent(new CustomEvent("qdsoverflowcheck"));

//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "visible");

//     const initialScrollTop = viewportEl.scrollTop;

//     const scrollbarEl = await VerticalScrollbar.element();
//     const rect = scrollbarEl.getBoundingClientRect();

//     // Dispatch click event directly on the scrollbar
//     scrollbarEl.dispatchEvent(
//       new MouseEvent("click", {
//         bubbles: true,
//         cancelable: true,
//         view: window,
//         clientX: rect.left + rect.width / 2,
//         clientY: rect.top + rect.height / 2,
//         screenX: rect.left + rect.width / 2,
//         screenY: rect.top + rect.height / 2,
//         button: 0
//       })
//     );

//     // Minimal delay for browser to process click event and update scroll position
//     await new Promise((resolve) => setTimeout(resolve, 10));

//     const newScrollTop = viewportEl.scrollTop;
//     expect(newScrollTop).toBeGreaterThan(initialScrollTop);
//   });
// });

// describe("a11y", () => {
//   test("viewport should support keyboard navigation", async () => {
//     render(<VerticalTest />);

//     await expect.element(Viewport).toBeInTheDocument();

//     const viewportEl = (await Viewport.element()) as HTMLElement;

//     // Verify viewport is focusable and can receive keyboard events
//     viewportEl.focus();
//     expect(document.activeElement).toBe(viewportEl);

//     // Manually test scroll with keyboard keys by setting scrollTop
//     // (Native keyboard scrolling is not reliable in browser test environments)
//     const initialScrollTop = viewportEl.scrollTop;

//     // Simulate scrolling down
//     viewportEl.scrollTop = 50;
//     viewportEl.dispatchEvent(new Event("scroll", { bubbles: true }));

//     expect(viewportEl.scrollTop).toBe(50);

//     // Simulate scrolling up
//     viewportEl.scrollTop = 25;
//     viewportEl.dispatchEvent(new Event("scroll", { bubbles: true }));

//     expect(viewportEl.scrollTop).toBe(25);
//   });

//   test("viewport should have proper accessibility attributes", async () => {
//     render(<VerticalTest />);

//     await expect.element(Viewport).toHaveAttribute("tabindex", "0");
//     await expect.element(Viewport).toHaveAttribute("role", "region");
//     await expect.element(Viewport).toHaveAttribute("aria-label");
//   });

//   test("viewport should be focusable", async () => {
//     render(<VerticalTest />);

//     await expect.element(Viewport).toBeInTheDocument();

//     const viewportEl = (await Viewport.element()) as HTMLElement;
//     viewportEl.focus();

//     const isFocused = document.activeElement === viewportEl;
//     expect(isFocused).toBe(true);
//   });

//   test("viewport should be in the tab order", async () => {
//     render(<VerticalTest />);

//     await userEvent.keyboard("{Tab}");

//     const viewportEl = await Viewport.element();
//     const isFocused = document.activeElement === viewportEl;
//     expect(isFocused).toBe(true);
//   });
// });

// describe("scrollbar visibility types", () => {
//   test('type="auto" should show scrollbar when content overflows', async () => {
//     render(<AutoTest />);

//     await expect.element(VerticalScrollbar).toBeInTheDocument();

//     // Manually trigger overflow check
//     const viewportEl = await Viewport.element();
//     viewportEl.dispatchEvent(new CustomEvent("qdsoverflowcheck"));

//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "visible");
//   });

//   test('type="auto" should hide scrollbar when content does not overflow', async () => {
//     render(<AutoNoOverflowTest />);

//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "hidden");
//   });

//   test('type="hover" should show scrollbar when hovering', async () => {
//     render(<HoverTest />);

//     await expect.element(VerticalScrollbar).toBeInTheDocument();

//     // Manually trigger overflow check
//     const viewportEl = await Viewport.element();
//     viewportEl.dispatchEvent(new CustomEvent("qdsoverflowcheck"));

//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "hidden");

//     await Root.hover();

//     // Minimal delay for browser to process hover event and update visibility
//     await new Promise((resolve) => setTimeout(resolve, 10));

//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "visible");

//     const rootEl = await Root.element();
//     const rect = rootEl.getBoundingClientRect();

//     // Move mouse away (to top-left corner)
//     rootEl.dispatchEvent(
//       new MouseEvent("mouseleave", {
//         bubbles: true,
//         cancelable: true,
//         view: window,
//         clientX: rect.left - 10,
//         clientY: rect.top - 10
//       })
//     );

//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "hidden");
//   });

//   test('type="hover" should remain hidden when content does not overflow', async () => {
//     render(<HoverNoOverflowTest />);

//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "hidden");

//     await Root.hover();

//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "hidden");
//   });

//   test('type="scroll" should show scrollbar when scrolling', async () => {
//     render(<ScrollTest />);

//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "hidden");

//     const viewportEl = await Viewport.element();
//     viewportEl.scrollTop = 50;

//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "visible");

//     // Wait for hideDelay (600ms) + buffer
//     await new Promise((resolve) => setTimeout(resolve, 650));

//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "hidden");
//   });

//   test('type="always" should always show scrollbar when content overflows', async () => {
//     render(<AlwaysTest />);

//     await expect.element(VerticalScrollbar).toBeInTheDocument();

//     // Manually trigger overflow check
//     const viewportEl = await Viewport.element();
//     viewportEl.dispatchEvent(new CustomEvent("qdsoverflowcheck"));

//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "visible");

//     // Wait to ensure it stays visible (testing that it doesn't auto-hide)
//     await new Promise((resolve) => setTimeout(resolve, 1000));

//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "visible");
//   });

//   test('type="always" should hide scrollbar when content does not overflow', async () => {
//     render(<AlwaysNoOverflowTest />);

//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "hidden");
//   });

//   test("scrollbar should hide after custom hideDelay", async () => {
//     render(<CustomDelayTest />);

//     await expect.element(VerticalScrollbar).toBeInTheDocument();

//     const viewportEl = await Viewport.element();
//     viewportEl.scrollTop = 50;

//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "visible");

//     // Wait halfway through the 1000ms delay
//     await new Promise((resolve) => setTimeout(resolve, 500));
//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "visible");

//     // Complete the 1000ms delay
//     await new Promise((resolve) => setTimeout(resolve, 550));

//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "hidden");
//   });

//   test("overflow state should update when zoom changes", async () => {
//     render(<AutoTest />);

//     await expect.element(VerticalScrollbar).toBeInTheDocument();

//     // Manually trigger overflow check
//     const viewportEl = await Viewport.element();
//     viewportEl.dispatchEvent(new CustomEvent("qdsoverflowcheck"));

//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "visible");

//     // Simulate zoom out by increasing viewport size beyond content size (540px = 500px content + 40px padding)
//     const rootEl = (await Root.element()) as HTMLElement;

//     rootEl.style.height = "600px";
//     rootEl.style.width = "500px";

//     window.dispatchEvent(new Event("resize"));

//     // Trigger overflow check
//     viewportEl.dispatchEvent(new CustomEvent("qdsoverflowcheck"));

//     // Scrollbar should now be hidden since content (540px) fits in container (600px)
//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "hidden");

//     // Reset sizes to original - overflow should return
//     rootEl.style.height = "150px";
//     rootEl.style.width = "250px";

//     window.dispatchEvent(new Event("resize"));

//     // Trigger overflow check
//     viewportEl.dispatchEvent(new CustomEvent("qdsoverflowcheck"));

//     // Scrollbar should be visible again since content overflows
//     await expect.element(VerticalScrollbar).toHaveAttribute("data-state", "visible");
//   });
// });
