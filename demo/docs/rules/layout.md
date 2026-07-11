# Layout
===RULE===
id: layout-no-inline-style-sizing
title: Don't use inline style={{}} for layout sizing — use Tailwind arbitrary values
severity: dont
components:

Don't use inline `style={{}}` in React for layout sizing. Use Tailwind arbitrary values instead,
e.g. `h-[calc(100vh-80px)]`, so sizing stays inspectable in markup and consistent with the rest
of the styling approach.

===RULE===
id: layout-min-h-0
title: min-h-0 is required on a flex child for overflow-y-auto to scroll
severity: do
components:

A flex child needs `min-h-0` for `overflow-y-auto` to actually scroll. Without it, the flex item
grows to fit its content and pushes the parent taller instead of producing an internal scroll
region.

```
<div className="flex flex-col h-full">
  <div className="flex-1 overflow-y-auto min-h-0">...</div>
</div>
```

===RULE===
id: layout-no-mixed-grid-flex-row
title: Don't mix CSS grid and flexbox for the same row
severity: dont
components:

Pick one layout model per row. Don't apply `display: grid` and `display: flex` behavior to the
same row by nesting a flex row's children with grid-specific utilities — it produces
inconsistent alignment and makes the row hard to reason about.

===RULE===
id: layout-no-absolute-positioning-in-grid
title: Don't use absolute positioning for inline elements inside a grid layout
severity: dont
components:

Don't use absolute positioning to place inline elements inside a grid layout. Use a flex row for
inline element groupings instead — absolute positioning inside a grid breaks the grid's own flow
and sizing.

===RULE===
id: layout-icon-column-alignment
title: Use a fixed grid template to keep an icon column aligned across repeated rows
severity: do
components:

Use `grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2` (or a similar explicit column
template) to keep an icon column aligned across repeated rows, rather than relying on flexbox
spacing that can drift row to row.
