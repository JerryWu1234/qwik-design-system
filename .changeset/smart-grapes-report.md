---
"@qds.dev/ui": patch
"@qds.dev/tools": patch
"@qds.dev/utils": patch
---

### Major Changes

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
