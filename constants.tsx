
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
  sc: "Ponto baixo padrão (Altura: ~1 corr.)",
  dc: "Ponto alto mais alto (Altura: ~3 corr.)",
  hdc: "Meio ponto alto (Altura: ~2 corr.)",
  tr: "Ponto alto duplo (Altura: ~4 corr.)",
  inc: "Dois pontos trabalhados na mesma base",
  dec: "Dois pontos fechados juntos no topo",
  slst: "Ponto baixíssimo para unir"
};
