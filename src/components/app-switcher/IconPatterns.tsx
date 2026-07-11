export const TILE_PATTERN_COUNT = 6;

interface TilePatternProps {
  index: number;
  patternId: string;
}

function PatternDefs({ index, patternId }: TilePatternProps) {
  switch (((index % TILE_PATTERN_COUNT) + TILE_PATTERN_COUNT) % TILE_PATTERN_COUNT) {
    case 0:
      // Diagonal lines
      return (
        <pattern
          id={patternId}
          width={10}
          height={10}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1={0} y1={0} x2={0} y2={10} stroke="#fff" strokeWidth={2} />
        </pattern>
      );
    case 1:
      // Dot grid
      return (
        <pattern id={patternId} width={9} height={9} patternUnits="userSpaceOnUse">
          <circle cx={2} cy={2} r={1.4} fill="#fff" />
        </pattern>
      );
    case 2:
      // Concentric rings
      return (
        <pattern id={patternId} width={16} height={16} patternUnits="userSpaceOnUse">
          <circle
            cx={8}
            cy={8}
            r={7}
            fill="none"
            stroke="#fff"
            strokeWidth={1.4}
          />
          <circle cx={8} cy={8} r={2.4} fill="#fff" />
        </pattern>
      );
    case 3:
      // Cross / plus grid
      return (
        <pattern id={patternId} width={12} height={12} patternUnits="userSpaceOnUse">
          <path d="M6 2v8M2 6h8" stroke="#fff" strokeWidth={1.4} strokeLinecap="round" />
        </pattern>
      );
    case 4:
      // Chevron stripes
      return (
        <pattern
          id={patternId}
          width={12}
          height={12}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(90)"
        >
          <path
            d="M0 3 L6 9 L12 3"
            fill="none"
            stroke="#fff"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        </pattern>
      );
    case 5:
    default:
      // Wave lines
      return (
        <pattern id={patternId} width={16} height={8} patternUnits="userSpaceOnUse">
          <path
            d="M0 4 Q4 0 8 4 T16 4"
            fill="none"
            stroke="#fff"
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        </pattern>
      );
  }
}

export function TilePattern({ index, patternId }: TilePatternProps) {
  return (
    <>
      <defs>
        <PatternDefs index={index} patternId={patternId} />
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </>
  );
}
