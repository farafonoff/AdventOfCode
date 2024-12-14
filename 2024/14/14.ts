import { sign } from "crypto";
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
let DEBUG = false;

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
let [rows, cols] = [103, 101];
if (infile.search(/test/) >= 0) {
  [rows, cols] = [7, 11];
}
let robots = [];
let rre = /p=(-?\d+),(-?\d+) v=(-?\d+),(-?\d+)/;
contents.forEach((line) => {
  let [_, px, py, vx, vy] = line.match(rre);
  robots.push([Number(px), Number(py), Number(vx), Number(vy)]);
});

dbg(robots);

function wrap(x, limit) {
  if (x < 0) {
    return (limit + x % limit) % limit;
  } else {
    return x % limit;
  }
}

let getEndPositions1 = (robots, steps) => {
  let endpos = [];
  robots.forEach(([px, py, vx, vy]) => {
    endpos.push([px + vx * steps, py + vy * steps]);
  });
  endpos = endpos.map(([x, y]) => {
    return [wrap(x, cols), wrap(y, rows)];
  });
  return endpos;
}

let ends = getEndPositions1(robots, 100);
let counter = new HM<[number, number], number>();
ends.forEach((pos) => {
  incHM(counter, pos, 1);
});
/*
let robot = [2, 4, 2, -3];
for(let jj = 0; jj < 6; jj++) {
  //test one p=2,4 v=2,-3
  let endpos = getEndPositions1([robot], jj);
  dbg(endpos);
}*/

let quads = [[0,0], [0,0]]

counter.entries().forEach(([[j , i], c]) => {
  let qrow: number[]
  if (i * 2 < rows - 1) {
    qrow = quads[0];
  } else if (i * 2 > rows) {
    qrow = quads[1];
  } if (qrow) {
    if (j * 2 < cols - 1) {
      qrow[0] += c;
    } else if (j * 2 > cols) {
      qrow[1] += c;
    }
  }
});


answer(1, quads[0][0] * quads[0][1] * quads[1][0] * quads[1][1]);
let [H ,V ] = [0,0]

for (let step = 0; step < 100000; step += 1) {
  let ends = getEndPositions1(robots, step);
  let thirds = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  ends.forEach(([x, y]) => {
    let [tx, ty] = [Math.floor(x * 3 / cols), Math.floor(y * 3 / rows)];
    _.set(thirds, [tx, ty], _.get(thirds, [tx, ty], 0) + 1);
  });
  let signal = thirds[1][1] > 3*thirds[0][0];
  if (signal) {
    if (thirds[0][1] > 3*thirds[0][0]) H = step;
    if (thirds[1][0] > 3*thirds[0][0]) V = step;
    if (H > 0 && V > 0) {
      break;
    }
  }
}

let step;
for(step=H;step;step+=rows) {
  if (step % cols === V) {
    break;
  }
}
answer(2, step);

DEBUG = false;
{
  let ends = getEndPositions1(robots, step);
  let counter = new HM<[number, number], number>();
  ends.forEach((pos) => {
    incHM(counter, pos, 1);
  });
  for(let i=0; i < rows + 1; i++) {
    let rrow = [];
    for(let j=0; j < cols + 1; j++) {
      rrow.push(counter.get([j, i]) || '.');
    }
    console.log(rrow.join(''));
  }
}

