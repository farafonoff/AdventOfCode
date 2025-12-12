import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
const infile = process.argv[2] || "input";

function cached<T extends Function>(fn: T): T {
  const cache = new HM();
  function inner() {
    let key = [...arguments];
    if (cache.has(key)) {
      return cache.get(key)
    }
    let res = fn(...arguments)
    cache.set(key, res)
    return res;
  }
  return inner as any;
}

function trnum(val: string): number | string {
  let nn = Number(val);
  if (val !== "" && isFinite(nn)) {
    return nn;
  }
  return val;
}
function decimalToHex(d, padding) {
  var hex = Number(d).toString(16);
  padding =
    typeof padding === "undefined" || padding === null
      ? (padding = 2)
      : padding;

  while (hex.length < padding) {
    hex = "0" + hex;
  }

  return hex;
}

const up = ([a,b]) => [a-1, b];
const down = ([a,b]) => [a+1, b];
const left = ([a,b]) => [a, b-1];
const right = ([a,b]) => [a, b+1];
const dirs = [up, down, left, right]

function incHM(tab: HM<unknown, number>, key: unknown, inc: number, dv = 0) {
  let ov = tab.get(key) || dv;
  tab.set(key, ov + inc);
}
let DEBUG = true;

function dbg(expression: any, message: string = ""): any {
  if (!DEBUG) {
    return expression;
  }
  if (message) {
    console.log(message, expression);
  } else {
    console.log(expression);
  }
  return expression;
}

function answer(part, value) {
  console.log(`Answer ${part}: ${value}`);
}

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trimEnd());

// Parse shapes
const shapes: string[][][] = [];
let i = 0;
while (i < contents.length) {
  const line = contents[i].trim();
  if (line === "") {
    i++;
    continue;
  }
  if (line.match(/^\d+:$/)) {
    const shapeLines: string[][] = [];
    i++; // skip the "N:" line
    while (i < contents.length && contents[i].trim() !== "" && !contents[i].includes(":") && !contents[i].includes("x")) {
      shapeLines.push(contents[i].split(""));
      i++;
    }
    shapes.push(shapeLines);
  } else {
    break;
  }
}

// Parse regions
const regions: {width: number, height: number, counts: number[]}[] = [];
while (i < contents.length) {
  if (contents[i].trim() === "") {
    i++;
    continue;
  }
  const match = contents[i].match(/(\d+)x(\d+): (.+)/);
  if (match) {
    const width = Number(match[1]);
    const height = Number(match[2]);
    const counts = match[3].split(" ").map(Number);
    regions.push({width, height, counts});
  }
  i++;
}

// Dancing Links implementation
class DLXNode {
  left: DLXNode;
  right: DLXNode;
  up: DLXNode;
  down: DLXNode;
  column: DLXNode;
  size: number;
  name: string;
  
  constructor(name = "") {
    this.left = this;
    this.right = this;
    this.up = this;
    this.down = this;
    this.column = this;
    this.size = 0;
    this.name = name;
  }
}

function cover(col: DLXNode) {
  col.right.left = col.left;
  col.left.right = col.right;
  
  for (let row = col.down; row !== col; row = row.down) {
    for (let node = row.right; node !== row; node = node.right) {
      node.down.up = node.up;
      node.up.down = node.down;
      node.column.size--;
    }
  }
}

function uncover(col: DLXNode) {
  for (let row = col.up; row !== col; row = row.up) {
    for (let node = row.left; node !== row; node = node.left) {
      node.column.size++;
      node.down.up = node;
      node.up.down = node;
    }
  }
  
  col.right.left = col;
  col.left.right = col;
}

function search(header: DLXNode, solution: DLXNode[]): boolean {
  if (header.right === header) {
    return true; // Solution found
  }
  
  // Choose column with smallest size (most constrained)
  let col = header.right;
  for (let c = header.right; c !== header; c = c.right) {
    if (c.size < col.size) {
      col = c;
    }
  }
  
  if (col.size === 0) {
    return false; // No solution
  }
  
  cover(col);
  
  for (let row = col.down; row !== col; row = row.down) {
    solution.push(row);
    
    for (let node = row.right; node !== row; node = node.right) {
      cover(node.column);
    }
    
    if (search(header, solution)) {
      return true;
    }
    
    solution.pop();
    
    for (let node = row.left; node !== row; node = node.left) {
      uncover(node.column);
    }
  }
  
  uncover(col);
  return false;
}

// Generate all rotations and flips of a shape
function getOrientations(shape: string[][]): string[][][] {
  const orientations: string[][][] = [];
  const seen = new Set<string>();
  
  function normalize(s: string[][]): string {
    return s.map(row => row.join("")).join("|");
  }
  
  function rotate90(s: string[][]): string[][] {
    const h = s.length;
    const w = s[0].length;
    const result: string[][] = [];
    for (let j = 0; j < w; j++) {
      result[j] = [];
      for (let i = h - 1; i >= 0; i--) {
        result[j].push(s[i][j]);
      }
    }
    return result;
  }
  
  function flipHorizontal(s: string[][]): string[][] {
    return s.map(row => [...row].reverse());
  }
  
  let current = shape;
  for (let rotation = 0; rotation < 4; rotation++) {
    const norm = normalize(current);
    if (!seen.has(norm)) {
      seen.add(norm);
      orientations.push(current);
    }
    
    const flipped = flipHorizontal(current);
    const normFlipped = normalize(flipped);
    if (!seen.has(normFlipped)) {
      seen.add(normFlipped);
      orientations.push(flipped);
    }
    
    current = rotate90(current);
  }
  
  return orientations;
}

// Get coordinates of '#' cells in a shape
function getShapeCells(shape: string[][]): [number, number][] {
  const cells: [number, number][] = [];
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j] === '#') {
        cells.push([i, j]);
      }
    }
  }
  return cells;
}

// Precompute all possible placements for each shape orientation
type Placement = {
  shapeIdx: number;
  cells: number[]; // flattened cell indices for max grid
};

const MAX_WIDTH = 50;
const MAX_HEIGHT = 50;

// Precompute all placements for maximum grid size
const allPlacements: Placement[][] = []; // allPlacements[shapeIdx] = array of placements

for (let shapeIdx = 0; shapeIdx < shapes.length; shapeIdx++) {
  const placements: Placement[] = [];
  const orientations = getOrientations(shapes[shapeIdx]);
  
  for (const orientation of orientations) {
    const cells = getShapeCells(orientation);
    
    // Try all possible positions in max grid
    for (let startRow = 0; startRow < MAX_HEIGHT; startRow++) {
      for (let startCol = 0; startCol < MAX_WIDTH; startCol++) {
        // Check if shape fits at this position
        let fits = true;
        const occupiedCells: number[] = [];
        
        for (const [dr, dc] of cells) {
          const r = startRow + dr;
          const c = startCol + dc;
          if (r < 0 || r >= MAX_HEIGHT || c < 0 || c >= MAX_WIDTH) {
            fits = false;
            break;
          }
          occupiedCells.push(r * MAX_WIDTH + c);
        }
        
        if (!fits) continue;
        
        placements.push({
          shapeIdx,
          cells: occupiedCells
        });
      }
    }
  }
  
  allPlacements.push(placements);
}

dbg(allPlacements.map(p => p.length), "Placements per shape:");

// Check if a region can fit all presents
function canFitPresents(width: number, height: number, counts: number[]): {result: boolean, tries: number} {
  // Build DLX matrix
  const header = new DLXNode("header");
  const columns: DLXNode[] = [];
  const columnMap = new Map<string, DLXNode>();
  
  // Create column headers for each present instance that must be placed (primary columns)
  const presentColumns: DLXNode[] = [];
  for (let shapeIdx = 0; shapeIdx < counts.length; shapeIdx++) {
    for (let instance = 0; instance < counts[shapeIdx]; instance++) {
      const colName = `shape_${shapeIdx}_${instance}`;
      const col = new DLXNode(colName);
      col.left = header.left;
      col.right = header;
      header.left.right = col;
      header.left = col;
      presentColumns.push(col);
      columnMap.set(colName, col);
    }
  }
  
  // Create column headers for each cell in the grid (secondary columns - optional coverage)
  // We make them secondary by adding them after a marker
  const secondaryStart = header.left;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const colName = `cell_${i}_${j}`;
      const col = new DLXNode(colName);
      col.left = header.left;
      col.right = header;
      header.left.right = col;
      header.left = col;
      columns.push(col);
      columnMap.set(colName, col);
    }
  }
  
  // Add rows: each possible placement of each present using precomputed placements
  let presentIdx = 0;
  for (let shapeIdx = 0; shapeIdx < counts.length; shapeIdx++) {
    for (let instance = 0; instance < counts[shapeIdx]; instance++) {
      // Filter placements that fit in this grid size
      for (const placement of allPlacements[shapeIdx]) {
        // Check if all cells fit in current grid
        let fits = true;
        const occupiedCells: number[] = [];
        
        for (const maxCellIdx of placement.cells) {
          const maxRow = Math.floor(maxCellIdx / MAX_WIDTH);
          const maxCol = maxCellIdx % MAX_WIDTH;
          
          if (maxRow >= height || maxCol >= width) {
            fits = false;
            break;
          }
          
          occupiedCells.push(maxRow * width + maxCol);
        }
        
        if (!fits) continue;
        
        // Create a row in the DLX matrix
        let rowStart: DLXNode | null = null;
        
        // Add node for this present instance (primary column)
        const presentNode = new DLXNode();
        const presentCol = presentColumns[presentIdx];
        presentNode.column = presentCol;
        
        // Insert into column
        presentNode.up = presentCol.up;
        presentNode.down = presentCol;
        presentCol.up.down = presentNode;
        presentCol.up = presentNode;
        presentCol.size++;
        
        rowStart = presentNode;
        
        // Add nodes for occupied cells (secondary columns - can overlap with . in shapes)
        for (const cellIdx of occupiedCells) {
          const node = new DLXNode();
          const col = columns[cellIdx];
          node.column = col;
          
          // Insert into column
          node.up = col.up;
          node.down = col;
          col.up.down = node;
          col.up = node;
          col.size++;
          
          // Insert into row
          node.left = rowStart.left;
          node.right = rowStart;
          rowStart.left.right = node;
          rowStart.left = node;
        }
      }
      presentIdx++;
    }
  }
  
  // Run DLX search - but only cover primary columns (present instances)
  // We need to modify search to only require covering the primary columns
  const solution: DLXNode[] = [];
  const stats = {tries: 0};
  const result = searchModified(header, solution, presentColumns.length, 0, stats);
  return {result, tries: stats.tries};
}

function searchModified(header: DLXNode, solution: DLXNode[], primaryCount: number, depth = 0, stats = {tries: 0}): boolean {
  // Check if all primary columns are covered
  let primaryCovered = 0;
  for (let c = header.right; c !== header; c = c.right) {
    if (c.name.startsWith("shape_")) {
      primaryCovered++;
    }
  }
  
  if (primaryCovered === 0) {
    return true; // All primary columns covered
  }
  
  // Choose a primary column with smallest size (most constrained)
  let col: DLXNode | null = null;
  for (let c = header.right; c !== header; c = c.right) {
    if (c.name.startsWith("shape_")) {
      if (col === null || c.size < col.size) {
        col = c;
      }
    }
  }
  
  if (col === null) {
    return true; // No more primary columns to cover
  }
  
  if (col.size === 0) {
    return false; // Primary column can't be covered
  }
  
  cover(col);
  
  // Limit search depth to avoid infinite loops
  const maxTries = 1000; // Adjust as needed
  
  for (let row = col.down; row !== col; row = row.down) {
    stats.tries++;
    if (stats.tries > maxTries) {
      uncover(col);
      return false; // Give up after too many attempts
    }
    
    solution.push(row);
    
    for (let node = row.right; node !== row; node = node.right) {
      cover(node.column);
    }
    
    if (searchModified(header, solution, primaryCount, depth + 1, stats)) {
      return true;
    }
    
    solution.pop();
    
    for (let node = row.left; node !== row; node = node.left) {
      uncover(node.column);
    }
  }
  
  uncover(col);
  return false;
}

// Count how many regions can fit their presents
// Sort regions by complexity (area * total presents) to process easier ones first
const indexedRegions = regions.map((r, idx) => ({
  ...r,
  originalIdx: idx,
  complexity: r.width * r.height * r.counts.reduce((a, b) => a + b, 0)
})).sort((a, b) => a.complexity - b.complexity);

let count = 0;
for (let i = 0; i < indexedRegions.length; i++) {
  const region = indexedRegions[i];
  const startTime = Date.now();
  const {result: fits, tries} = canFitPresents(region.width, region.height, region.counts);
  const elapsed = Date.now() - startTime;
  dbg(`Region ${region.originalIdx} (${region.width}x${region.height}, presents: ${region.counts.join(',')}, complexity: ${region.complexity}): ${fits ? 'YES' : 'NO'} in ${elapsed}ms (${tries} tries) [${i+1}/${indexedRegions.length}]`);
  if (fits) {
    count++;
  }
}

answer(1, count);
