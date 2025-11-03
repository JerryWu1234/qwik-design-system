// oxlint-disable no-empty-file
// import type { Locator, Page } from "@playwright/test";
// export type DriverLocator = Locator | Page;

// export function createTestDriver<T extends DriverLocator>(rootLocator: T) {
//   const getRoot = () => {
//     return rootLocator.locator("[ui-qds-calendar-root]");
//   };

//   const getLabel = () => {
//     return rootLocator.locator("[ui-qds-calendar-label]");
//   };

//   const getDateField = () => {
//     return rootLocator.locator("[ui-qds-calendar-field]");
//   };

//   const getSegments = () => {
//     return rootLocator.locator("[ui-qds-date-input-segment]");
//   };

//   const getYearSegment = () => {
//     return rootLocator.locator("[ui-qds-date-input-segment-year]");
//   };

//   const getMonthSegment = () => {
//     return rootLocator.locator("[ui-qds-date-input-segment-month]");
//   };

//   const getDaySegment = () => {
//     return rootLocator.locator("[ui-qds-date-input-segment-day]");
//   };

//   const getSetValueButton = () => {
//     return rootLocator.locator(".set-value-button");
//   };

//   const getCalendarGrid = () => {
//     return rootLocator.locator("[ui-qds-calendar-grid]");
//   };

//   const getCalendarGridDayButtons = () => {
//     return rootLocator.locator("[ui-qds-calendar-grid-day-button]");
//   };

//   const getSelectedDayButton = () => {
//     return rootLocator.locator("[ui-qds-calendar-grid-day-button][ui-selected]");
//   };

//   const getTrigger = () => {
//     return rootLocator.locator("[ui-qds-calendar-trigger]");
//   };

//   const getCalendarTitle = () => {
//     return rootLocator.locator("[ui-qds-calendar-title]");
//   };

//   const getNextButton = () => {
//     return rootLocator.locator("[ui-qds-calendar-next]");
//   };

//   const getPreviousButton = () => {
//     return rootLocator.locator("[ui-qds-calendar-previous]");
//   };

//   const getOpenStatus = () => {
//     return rootLocator.locator("[ui-qds-calendar-test-open-status]");
//   };

//   const getExternalToggle = () => {
//     return rootLocator.locator("[ui-qds-calendar-test-external-toggle]");
//   };

//   return {
//     ...rootLocator,
//     locator: rootLocator,
//     getRoot,
//     getLabel,
//     getDateField,
//     getSegments,
//     getYearSegment,
//     getMonthSegment,
//     getDaySegment,
//     getSetValueButton,
//     getCalendarGrid,
//     getCalendarGridDayButtons,
//     getSelectedDayButton,
//     getTrigger,
//     getCalendarTitle,
//     getNextButton,
//     getPreviousButton,
//     getOpenStatus,
//     getExternalToggle
//   };
// }
