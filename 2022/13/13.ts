import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _, { isArray } from "lodash";
const infile = process.argv[2] || "input";

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
  .filter((s) => !!s)
  .map((s) => s && JSON.parse(s));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let pairs = [];
let pair = [];
DEBUG = false;
let contents2 = [...contents];
while (contents.length) {
  pair[0] = contents.shift();
  pair[1] = contents.shift();
  pairs.push(pair);
  pair = [];
}

let compare = (p1, p2) => {
  dbg([p1, p2]);
  if (typeof p1 === "number" && typeof p2 === "number") {
    return p2 - p1;
  }
  if (isArray(p1) && isArray(p2)) {
    let mins = Math.min(p1.length, p2.length);
    for (let i = 0; i < mins; ++i) {
      let cv = compare(p1[i], p2[i]);
      if (cv !== 0) return cv;
    }
    return p2.length - p1.length;
  }
  if (!isArray(p1)) p1 = [p1];
  if (!isArray(p2)) p2 = [p2];
  return compare(p1, p2);
};

dbg(pairs);

let a1 = pairs.reduce((pv, cv, idx) => {
  let cc = compare(cv[0], cv[1]);
  dbg(cc);
  if (cc > 0) {
    return pv + idx + 1;
  }
  return pv;
}, 0);

answer(1, a1);

let D1 = [[2]];
let D2 = [[6]];
contents2.push(D1);
contents2.push(D2);
contents2.sort((a, b) => compare(b, a));

let di1 = contents2.indexOf(D1) + 1;
let di2 = contents2.indexOf(D2) + 1;
answer(2, di1 * di2);
