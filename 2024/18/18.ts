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
  .map((s) => s.trim())
  .filter((s) => s.length > 0);
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content

let rows
let cols
let initialCount
if (infile.includes("input.test")) {
  rows = 6
  cols = 6
  initialCount = 12
} else {
  rows = 70
  cols = 70
  initialCount = 1024
}
++rows;
++cols;

let poss = [];
contents.forEach((line) => {
  let [r, c] = line.split(",").map(Number);
  poss.push([r, c]);  
});

function solve(initialCount) {
  let grid = [];
  for (let i = 0; i < rows; i++) {
    grid.push(Array(cols).fill(0));
  }
  for (let i = 0; i <= initialCount; i++) {
    let [r, c] = poss[i];
    grid[r][c] = i + 1;
  }
  function bfs(start, end) {
    let q = new PQ<[number, [number, number]]>({ comparator: (a, b) => a[0] - b[0] });
    let visited = new HM();
    q.queue([0, start]);
    while (q.length > 0) {
      let [dist, [r, c]] = q.dequeue();
      if (visited.has([r, c])) {
        continue;
      }
      visited.set([r, c], dist);
      if (r === end[0] && c === end[1]) {
        return dist;
      }
      dirs.forEach((dir) => {
        let [nr, nc] = dir([r, c]);
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
          return;
        }
        if (grid[nr][nc] > 0) {
          return;
        }
        if (visited.has([nr, nc])) {
          return;
        }
        q.queue([dist + 1, [nr, nc]]);
      });
    }
  }

  let ans1 = bfs([0, 0], [rows - 1, cols - 1]);
  return ans1;
}

let ans1 = solve(initialCount-1);
answer(1, ans1);

for(let i=0;i<poss.length;i++) {
  let res = solve(i);
  //console.log({i, res, poss: poss[i]});
  if (res === undefined) {
    let ans2 = poss[i].join(',');
    answer(2, ans2);
    break;
  }
}
