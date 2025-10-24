# @qds.dev/ui-headless

## 0.4.3

### Patch Changes

- 5d199cb: ### Collapsible Component Enhancements

  - Added "hidden until found" behavior support for improved content discovery and browser search functionality
  - Updated data attributes for better state management and styling hooks
  - Enhanced collapsible attributes API

  ### Bug Fixes

  - Fixed Tree component example
  - Fixed TypeScript type definitions

  ### Testing

  - Added browser tests for improved component coverage

## 0.4.2

### Patch Changes

- 5e5aae7: ### Major Changes

  - **Scoped Styles System** (#307): Complete rewrite of the styling system with significant architectural improvements
    - Implemented v2 scoped styles architecture
    - Simplified checkbox root attributes
    - Correct backpatch handling for reactive updates
    - Proper SSR unmount behavior
    - Managed ARIA IDs for accessibility
    - Isomorphic DOM nodes for better SSR/CSR consistency
    - Global observer for SSR unmount optimization
    - Transform function for library builds
    - QRL injection with unit tests
    - Improved value binding system that ignores adding attributes in the DOM
    - Better DX ergonomics for edge cases

  ### Minor Changes

  - **Vitest 4 Upgrade** (#310): Migrated to Vitest 4 with improved testing infrastructure

    - Updated test runners across multiple components
    - Partial conversion to new vitest system (#293)
    - Updated QR Code tests (#292)
    - Updated Progress tests (#291)
    - Updated Scroll Area tests (#295)
    - Updated Slider tests (#296)
    - Updated Switch tests (#300)
    - Updated Tabs tests (#301)
    - Updated Toggle tests (#302)
    - Added pagination tests (#288)
    - Added Label and Menu tests (#286)
    - Fixed last tests + nesting scopes (#314)
    - SSR tests working (#315)

  - **Modal & Collapsible Enhancements** (#312):

    - Added data attributes to Modal component
    - Changed scope naming convention
    - Added data attributes to Collapsible component

  - **Field Component Data Attributes** (#309): Added proper data attributes to Field component for better styling and state management

  - **Icon Improvements** (#311): Icons now respect `1em` as the default size, improving typography integration

  ### Patch Changes

  - **Checkbox Layout Fix** (#313): Fixed layout issues in checkbox component
  - **Slider Update** (#308): V2 slider improvements and updates
  - **Dependencies Update** (#305): Updated package dependencies and pnpm lockfile
  - **Documentation**:
    - Removed broken SVG in README
    - Updated index.mdx (#299)
  - **Testing**:
    - Added additional tests (#303)

## 0.4.1

### Patch Changes

- 3da5742: feat: icons now support the title and description props for accessible titles and descroptions

## 0.4.0

### Minor Changes

- 4b74fe7: ## New Components

  ### Field Component

  Introduces a new headless Field component for building accessible form inputs with proper labeling, descriptions, and error handling.

  **Components:**

  - `Field.Root` - Root container with value management and context provider
  - `Field.Label` - Accessible label that associates with the input
  - `Field.Input` - Input element with automatic accessibility attributes
  - `Field.Textarea` - Optional Textarea element when Input is not present with automatic accessibility attributes
  - `Field.Description` - Optional description text for additional context
  - `Field.Error` - Error message display with proper ARIA linking

  **Features:**

  - Automatic ARIA attribute management (`aria-describedby`, `aria-invalid`, `aria-required`)
  - Flexible value handling (supports both root-level and component-level `bind:value` and `value` props)
  - Built-in support for required, disabled, and readonly states
  - Full accessibility compliance with comprehensive test coverage

  ## Utilities

  ### mergeRefs

  Adds a new `mergeRefs` utility function in `@qds.dev/utils` for composing multiple refs together. This utility is useful when you need to forward a ref to a child component while also maintaining your own ref to the same element.

## 0.3.3

### Patch Changes

- 8c3759c: fix: rolldown chunking
- 8c3759c: feat: migrate components library to rolldown instead of vite

## 0.3.2

### Patch Changes

- 9ad77d6: feat: migrate components library to rolldown instead of vite

## 0.3.1

### Patch Changes

- 9655c87: - Rework DateInput separator API
  - Rename DateInput.DateEntry to DateInput.Field
  - Update Calendar component

## 0.3.0

### Minor Changes

- 8e70f8d: - Rework DateInput separator API
  - Rename DateInput.DateEntry to DateInput.Entry

### Patch Changes

- 8c0cb1d: DS-452 Headless Progress component
- 8961bb8: DS-442 Work on the toast component
- 59ca322: DS-428 Dropdown component
- c21f15c: latest calendar

## 0.2.0

### Minor Changes

- d2415a0: Move date input/output from Root to DateEntry in order to support multiple dates

### Patch Changes

- 15be56a: feat: rename Error Message, Page to Item, and Item prefix to radio group for consistency

## 0.1.0

### Minor Changes

- 66b5545: Add DateInput component

### Patch Changes

- 95e8e55: feat: tabs component

## 0.0.12

### Patch Changes

- 5a9d42c: feat: correctly exit the tree compoenent on focus management
- ce67467: fix: tree accessibility

## 0.0.11

### Patch Changes

- 9f6ad22: Work on resizable component - initial version
- 0ca0492: Work on the Switch component.
- a9f479d: DS-415 Resizable component. Remove unnecessary.
- 28b38c9: feat: add license

## 0.0.10

## 0.0.9

### Patch Changes

- 6cc9c96: Replace Kunai logo with the dark and light mode in the Created By Kunai section
- 192d983: Added Stackblitz integration for each component example in the docs.
- a527c1d: Add native form support to Checklist
- 4a5cfb9: feat: support tree item navigation

## 0.0.8

### Patch Changes

- e88ff7d: fix: radio group data attribute handling

## 0.0.7

### Patch Changes

- c9e7468: Address feedback

## 0.0.6

### Patch Changes

- da0b5cf: Fix types reference

## 0.0.5

### Patch Changes

- d481f1a: Work on the radio-group component
- 1c62fff: Added missing documents
- c767656: Work on the DocsAI generation.
- 844a5cc: Work on the toast component
- d4ad550: Work on the slider component

## 0.0.4

### Patch Changes

- 3e2b105: QR Code component
- 6d93576: Add ScrollArea to the TOC
- 321e705: QRCode Overlay reworked.
- 7754a25: Fixed the issue with auto-api/api.ts; resolved the incorrect renaming in Public.
- c6337ba: fix: only preserve modules in prod

## 0.0.3

### Patch Changes

- e829802: Avoid querySelector and parentElement.
- fd53127: Fix lint issues. The lint script can be used now.
- 328f704: feat: adds support for pw managers

## 0.0.2

### Patch Changes

- fe85765: File Upload component
- 66f64a2: Clear headless scroll-area component.

## 0.0.1

### Patch Changes

- 4806309: • 🔢 OTP (One-Time Password)

  - Hidden native input for mobile keyboards
  - Paste support from password managers
  - Keyboard navigation (Left/Right/Up/Down)
  - Customizable caret indicator
  - onChange$ and onComplete$ callbacks
  - Disabled state support

  • ✅ Checkbox

  - Mixed/indeterminate state support
  - Form binding with hidden native input
  - Error message handling
  - Custom description text
  - Two-way data binding
  - Custom indicator support
  - WAI-ARIA compliant

  • 📋 Checklist

  - Select all functionality
  - Individual item selection
  - Nested checkbox structure
  - Context-based state management
  - Mixed state propagation
  - Form validation support
  - Error message handling

  • 📄 Pagination

  - Dynamic page calculation
  - Customizable sibling count
  - First/Last page navigation
  - Custom ellipsis support
  - Controlled and uncontrolled modes
  - Page range customization
  - WAI-ARIA compliant navigation

  • 📜 Scroll Area

  - Both vertical and horizontal scrolling
  - Smooth thumb dragging
  - Click-to-scroll track support
  - Auto-hiding scrollbars
  - Dynamic thumb sizing
  - Custom scrollbar styling
  - Native keyboard shortcuts support

## 0.0.5

### Patch Changes

- c304bc7: feat: fixed versioned packages
  feat: pr title updates with version number

## 0.0.4

### Patch Changes

- f8414fe: otp component initial implementation

## 0.0.3

### Patch Changes

- 80cb16e: feat: new package names

## 0.0.2

### Patch Changes

- 2eb7048: feat: adding changesets
