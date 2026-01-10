
export enum StitchType {
  SC = 'sc',      // Single Crochet
  DC = 'dc',      // Double Crochet
  HDC = 'hdc',    // Half Double Crochet
  TR = 'tr',      // Treble Crochet
  // INC = 'inc',    // Increase (2 sc in one)
  // DEC = 'dec',    // Decrease (sc2tog)
  // SLST = 'slst'   // Slip stitch
}

export enum ConstructionMode {
  FLAT = 'FLAT',
  ROUND = 'ROUND'
}

export interface StitchInstance {
  id: string;
  type: StitchType;
  color?: string;
}

export interface Row {
  id: string;
  stitches: StitchInstance[];
}

export interface Pattern {
  name: string;
  mode: ConstructionMode;
  rows: Row[];
}
