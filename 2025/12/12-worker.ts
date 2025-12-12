import * as fs from "fs";

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

type Placement = {
  shapeIdx: number;
  cells: number[];
};

function canFitPresents(
  width: number, 
  height: number, 
  counts: number[],
  allPlacements: Placement[][],
  maxWidth: number
): {result: boolean, tries: number} {
  const header = new DLXNode("header");
  const columns: DLXNode[] = [];
  
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
    }
  }
  
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const colName = `cell_${i}_${j}`;
      const col = new DLXNode(colName);
      col.left = header.left;
      col.right = header;
      header.left.right = col;
      header.left = col;
      columns.push(col);
    }
  }
  
  let presentIdx = 0;
  for (let shapeIdx = 0; shapeIdx < counts.length; shapeIdx++) {
    for (let instance = 0; instance < counts[shapeIdx]; instance++) {
      for (const placement of allPlacements[shapeIdx]) {
        let fits = true;
        const occupiedCells: number[] = [];
        
        for (const maxCellIdx of placement.cells) {
          const maxRow = Math.floor(maxCellIdx / maxWidth);
          const maxCol = maxCellIdx % maxWidth;
          
          if (maxRow >= height || maxCol >= width) {
            fits = false;
            break;
          }
          
          occupiedCells.push(maxRow * width + maxCol);
        }
        
        if (!fits) continue;
        
        let rowStart: DLXNode | null = null;
        
        const presentNode = new DLXNode();
        const presentCol = presentColumns[presentIdx];
        presentNode.column = presentCol;
        
        presentNode.up = presentCol.up;
        presentNode.down = presentCol;
        presentCol.up.down = presentNode;
        presentCol.up = presentNode;
        presentCol.size++;
        
        rowStart = presentNode;
        
        for (const cellIdx of occupiedCells) {
          const node = new DLXNode();
          const col = columns[cellIdx];
          node.column = col;
          
          node.up = col.up;
          node.down = col;
          col.up.down = node;
          col.up = node;
          col.size++;
          
          node.left = rowStart.left;
          node.right = rowStart;
          rowStart.left.right = node;
          rowStart.left = node;
        }
      }
      presentIdx++;
    }
  }
  
  const solution: DLXNode[] = [];
  const stats = {tries: 0};
  const result = searchModified(header, solution, presentColumns.length, 0, stats);
  return {result, tries: stats.tries};
}

function searchModified(header: DLXNode, solution: DLXNode[], primaryCount: number, depth = 0, stats = {tries: 0}): boolean {
  let primaryCovered = 0;
  for (let c = header.right; c !== header; c = c.right) {
    if (c.name.startsWith("shape_")) {
      primaryCovered++;
    }
  }
  
  if (primaryCovered === 0) {
    return true;
  }
  
  let col: DLXNode | null = null;
  for (let c = header.right; c !== header; c = c.right) {
    if (c.name.startsWith("shape_")) {
      if (col === null || c.size < col.size) {
        col = c;
      }
    }
  }
  
  if (col === null) {
    return true;
  }
  
  if (col.size === 0) {
    return false;
  }
  
  cover(col);
  
  const maxTries = 1000;
  
  for (let row = col.down; row !== col; row = row.down) {
    stats.tries++;
    if (stats.tries > maxTries) {
      uncover(col);
      return false;
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

// Main worker code
const args = process.argv.slice(2);
const inputFile = args[0];
const startIdx = parseInt(args[1]);
const endIdx = parseInt(args[2]);

const contents = fs
  .readFileSync(inputFile, "utf8")
  .split("\n")
  .map((s) => s.trimEnd());

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
    i++;
    while (i < contents.length && contents[i].trim() !== "" && !contents[i].includes(":") && !contents[i].includes("x")) {
      shapeLines.push(contents[i].split(""));
      i++;
    }
    shapes.push(shapeLines);
  } else {
    break;
  }
}

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

const MAX_WIDTH = 50;
const MAX_HEIGHT = 50;

const allPlacements: Placement[][] = [];

for (let shapeIdx = 0; shapeIdx < shapes.length; shapeIdx++) {
  const placements: Placement[] = [];
  const orientations = getOrientations(shapes[shapeIdx]);
  
  for (const orientation of orientations) {
    const cells = getShapeCells(orientation);
    
    for (let startRow = 0; startRow < MAX_HEIGHT; startRow++) {
      for (let startCol = 0; startCol < MAX_WIDTH; startCol++) {
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

const results: any[] = [];
for (let idx = startIdx; idx < endIdx && idx < regions.length; idx++) {
  const region = regions[idx];
  const startTime = Date.now();
  const {result: fits, tries} = canFitPresents(region.width, region.height, region.counts, allPlacements, MAX_WIDTH);
  const elapsed = Date.now() - startTime;
  results.push({
    idx,
    fits,
    tries,
    elapsed,
    width: region.width,
    height: region.height,
    counts: region.counts
  });
}

console.log(JSON.stringify(results));
