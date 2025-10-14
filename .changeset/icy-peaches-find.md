---
"@qds.dev/ui": minor
"@qds.dev/utils": minor
---

## New Components

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
