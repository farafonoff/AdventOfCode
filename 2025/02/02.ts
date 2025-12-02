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
let ranges = [];
contents.forEach((line) => {
  let parts = line.split(",").map(s => s.split("-").map(Number));
  ranges = ranges.concat(parts.filter(p => p.length == 2).map(p => [p[0], p[1]]));
});
let uniqueSet = new Set<number>();
function countInvalid2(range: number[], times = 2) {
  let [start, end] = range;
  let invalid = 0;
  let isum = 0;
  let l1 = String(start).length;
  let l2 = String(end).length;
  if (l2 > l1) {
    isum += countInvalid2([start, 10**l1 - 1], times);
    isum += countInvalid2([10**(l2-1), end], times);
    return isum;
  }
  let l = String(start).length;
  if (l%times !== 0) {
    //console.log(`Skip length ${l} range ${start}-${end} for times=${times}`);
    return 0;
  }
  let lp = l / times;
  let lh = lp * (times - 1);
  let divisor = 10**lh;
  let halfStart = Math.floor(start / divisor);
  let halfEnd = Math.floor(end / divisor);
  //console.log(`Counting invalid in range ${start}-${end} for times=${times} half ${halfStart}-${halfEnd}`);
  for (let h = halfStart; h <= halfEnd; ++h) {
    let invid = Number(String(h).repeat(times));
    if (invid >= start && invid <= end) {
      if (uniqueSet.has(invid)) {
        continue;
      }
      uniqueSet.add(invid);
      ++invalid;
      isum += invid;
    }
  }
  return isum;
}
let a1 = ranges.map(r => countInvalid2(r,2)).reduce((a,b) => a + b, 0);
answer(1, a1);
let a2 = a1;
for(let t = 3; t <= 10; ++t) {
  a2 += ranges.map(r => countInvalid2(r,t)).reduce((a,b) => a + b, 0);
}
answer(2, a2);