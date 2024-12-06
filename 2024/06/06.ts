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

function dbgMat(map) {
  console.log(map.map((row) => row.join('')).join('\n'));
  console.log('====================');
}

function answer(part, value) {
  console.log(`Answer ${part}: ${value}`);
}

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
const map = [];
let guard = [];
const pos = [];
let vec = [];
contents.forEach((line) => {
  map.push(line.split(""));
  if (line.indexOf('^') >= 0) {
    guard = [map.length-1, line.indexOf('^')];
    vec =[-1, 0];
  }
});

_.set(map, guard, 'X');
const rotR = [[0, 1], [-1, 0]];

const mulVecMat = (vec, mat) => {
  return [vec[0]*mat[0][0] + vec[1]*mat[0][1], vec[0]*mat[1][0] + vec[1]*mat[1][1]];
}

function getAns1(map) {
  return map
  .map(row => row.filter((ch) => ch === 'X' || ch === '^').length)
  .reduce((acc, row) => {
    return acc + row;
  });
}

const vecAdd = (a, b) => [a[0]+b[0], a[1]+b[1]];

dbg(mulVecMat([-1, 0], rotR));
dbg(mulVecMat([0, 1], rotR));
dbg(mulVecMat([1, 0], rotR));
dbg(mulVecMat([0, -1], rotR));

class LoopError extends Error {
  mat: any;
  constructor(mat: any) {
    super("Loop detected");
    this.mat = mat;
  }
}

function solve(map, guard, vec) {
  const visited = new HM();
  visited.set([...guard, ...vec], 1);
  do {
    const nextGuard = vecAdd(guard, vec);
    const posKey = [...nextGuard, ...vec];
    if (visited.has(posKey)) {
      throw new LoopError(map);
    }
    visited.set(posKey, 1);
    const ch = _.get(map, nextGuard);
    if (ch === undefined) {
      break;
    }
    if (ch === '#' || ch === 'O') {
      vec = mulVecMat(vec, rotR);
    }
    if (ch === '.' || ch === 'X' || ch === '^') {
      _.set(map, nextGuard, 'X');
      guard = nextGuard;
      pos.push([...guard]);
    }
    //dbgMat(map);
  } while (true);
  return map;
}

const part1 = solve(_.cloneDeep(map), guard, vec);
dbgMat(part1);
answer(1, getAns1(part1));

let candidates = [];
for(let i=0;i<part1.length;i++) {
  for(let j=0;j<part1[i].length;j++) {
    if (part1[i][j] === '#') {
      continue;
    }
    if (part1[i][j] === 'X') {
      candidates.push([i,j]);
    }
  }
}

dbgMat(part1);
dbgMat(map);

dbg(candidates);
let loops = 0;
candidates.forEach(([i,j]) => {
  const loopMat = _.cloneDeep(map);
  _.set(loopMat, [i,j], 'O');
  try {
    solve(loopMat, guard, vec);
  } catch(e) {
    if (e instanceof LoopError) {
      ++loops;
      dbgMat(e.mat);
      dbg([i,j], 'LOOP');
    }
  }
});

answer(2, loops);