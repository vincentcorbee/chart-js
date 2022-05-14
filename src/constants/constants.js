export const FILTER = `<filter id="dropshadow">
  <feGaussianBlur stdDeviation="2" in="SourceAlpha"></feGaussianBlur> <!-- stdDeviation is how much to blur -->
  <feOffset dx="0" dy="0" result="offsetblur"></feOffset> <!-- how much to offset -->
    <feComponentTransfer><feFuncA type="linear" slope="0.5"></feFuncA></feComponentTransfer>
  <feMerge>
    <feMergeNode></feMergeNode> <!-- this contains the offset blurred image -->
    <feMergeNode in="SourceGraphic"></feMergeNode> <!-- this contains the element that the filter is applied to -->
  </feMerge>
</filter>`
export const VALUE_SIZE = 11
export const LEGEND_SIZE = 12