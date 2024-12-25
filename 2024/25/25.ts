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
  //.filter((s) => s.length > 0);
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content

DEBUG = false;
let locks = [];
let keys = [];
let scan = [];
let th = 0;
if (_.last(contents).length > 0) contents.push('')
contents.forEach((line) => {
  if (line.length > 0) {
    scan.push(line.split(''))
  } else {
    dbg(scan)
    th = scan.length;
    if (scan[0].every(ch => ch === '#')) {
      locks.push(calcCols(scan))
      scan = []
    } else
    if (_.last(scan).every(ch => ch === '#')) {
      keys.push(calcCols(scan))
      scan = []
    }
  }
});

function calcCols(scan) {
  return scan[0].map((cv, ci) => {
    return scan.map(row => row[ci]).filter(ch => ch === '#').length - 1
  })
}

dbg(th)
dbg(keys)
dbg(locks)

function fit(key, lock) {
  return key.every((kv, ki) => kv + lock[ki] + 2 <= th)
}
let ans = 0;
for (let lock of locks) {
  for (let key of keys) {
    if (fit(key, lock)) {
      dbg({ lock, key }, "fit");
      ++ans;
    } else {
      dbg({ lock, key }, "nofit");
    }
  }
}
answer(1, ans)