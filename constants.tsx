
export const STITCH_COLORS = [
  '#f0e6dc', // Natural
  '#ff9999', // Coral
  '#99ccff', // Sky Blue
  '#ccff99', // Mint
  '#ffcc99', // Peach
  '#ff99cc', // Pink
  '#99ffcc', // Seafoam
  '#ccccff', // Lavender
];

export const STITCH_HEIGHTS: Record<string, number> = {
  sc: 0.6,
  dc: 1.4,
  hdc: 1.0,
  tr: 1.8,
  inc: 0.6,
  dec: 0.7,
  slst: 0.2
};

export const STITCH_DESCRIPTIONS: Record<string, string> = {
  sc: "Standard single crochet (Height: ~1 chain)",
  dc: "Taller double crochet (Height: ~3 chains)",
  hdc: "Medium half-double (Height: ~2 chains)",
  tr: "Very tall treble (Height: ~4 chains)",
  inc: "Two stitches worked into one base",
  dec: "Two stitches joined at the top",
  slst: "Flat joining stitch"
};
