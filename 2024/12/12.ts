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

const up = ([a, b]) => [a - 1, b];
const down = ([a, b]) => [a + 1, b];
const left = ([a, b]) => [a, b - 1];
const right = ([a, b]) => [a, b + 1];
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
let map = [];
contents.forEach((line) => {
  map.push(line.split(''));
});

DEBUG = false;

function fillRegion(map, i, j, c, factor = 1) {
  let q = [[i, j]];
  let area = new HM<number[], number>();
  let boundary = [];
  let perimeter = 0;
  while (q.length > 0) {
    let [a, b] = q.pop();
    if (a < 0 || a >= map.length || b < 0 || b >= map[a].length) {
      perimeter++;
      boundary.push([a, b]);
      continue;
    }
    if (map[a][b] !== c) {
      if (!area.has([a, b])) {
        perimeter++;
        boundary.push([a, b]);
      }
      continue;
    }
    area.set([a, b], 1);
    map[a][b] = '.';
    q.push([a - 1, b]);
    q.push([a + 1, b]);
    q.push([a, b - 1]);
    q.push([a, b + 1]);
  }
  const cost = area.count() * perimeter;
  let vdir = [up, down];
  let hdir = [left, right];
  let sides = [];
  let uniqueBoundaries = boundary.filter(([a, b]) =>
    boundary.filter(([aa, bb]) => aa === a && bb === b).length === 1
  );
  let visited = new Set();
  uniqueBoundaries.forEach(([a, b], idx) => {
    let dir = vdir;
    if (area.has(up([a, b])) || area.has(down([a, b]))) {
      dir = hdir;
    }
    if (area.has(left([a, b])) || area.has(right([a, b]))) {
      dir = vdir;
    }
    while (uniqueBoundaries.find(([aa, bb]) => aa === a && bb === b)) {
      [a, b] = dir[0]([a, b]);
    }
    [a, b] = dir[1]([a, b]);
    let ci = uniqueBoundaries.findIndex(([aa, bb]) => aa === a && bb === b);
    if (visited.has(ci)) {
      return;
    }
    let side = [];
    do {
      visited.add(ci);
      side.push([a, b]);
      [a, b] = dir[1]([a, b]);
      ci = uniqueBoundaries.findIndex(([aa, bb]) => aa === a && bb === b);
    } while (ci >= 0);
    sides.push(side);
  });
  let cost2 = area.count() * sides.length;
  dbg(`Area ${c}: ${area.count()} perimeter: ${perimeter} sides: ${sides.length}, cost: ${area.count() * perimeter}, cost2: ${cost2}`);
  return [cost / factor / factor / factor, cost2 / factor / factor];
}

function solve1(map, factor = 1) {
  let ans = 0;
  let ans2 = 0;
  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      let c = map[i][j];
      if (c === '.') {
        continue
      }
      let cost = fillRegion(map, i, j, c, factor);
      ans += cost[0];
      ans2 += cost[1];
    }
  }
  return [ans, ans2];
}

function dumpMap(map) {
  map.forEach((row) => {
    console.log(row.join(''));
  });
}
/*dumpMap(map);
let anz = solve1(_.cloneDeep(map));
answer(1, anz[0]);
answer(2, anz[1]);*/

function upscale2dmap(map: string[][], factor: number): string[][] {
  let newmap = [];
  for (let i = 0; i < map.length; i++) {
    let row = map[i];
    let newRow = row.flatMap((c) => {
      let res = [];
      for (let j = 0; j < factor; j++) {
        res.push(c);
      }
      return res;
    });
    for (let j = 0; j < factor; j++) {
      newmap.push([...newRow]);
    }
  }
  return newmap;
}

//dumpMap(upscale2dmap(map, 3));
let anz3 = solve1(_.cloneDeep(upscale2dmap(map, 3)), 3);
dbg(anz3)
answer(1, anz3[0]);
answer(2, anz3[1]);