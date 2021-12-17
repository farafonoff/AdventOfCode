import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
const infile = process.argv[2] || "input";

function trnum(val: string): number | string {
  let nn = Number(val);
  if (isFinite(nn)) {
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

/*var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);*/
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .map((s) => s.match(/target area: x=(-?\d+)..(-?\d+), y=(-?\d+)..(-?\d+)/)); // [orig, g1, g2 ...] = content
let [x1, x2, y1, y2] = contents[0].slice(1).map(Number);
DEBUG = false;
dbg([x1, x2, y1, y2]);
function sim(xv, yv) {
  let cc = [0, 0];
  let top = 0;
  while (cc[0] <= x2 + 1 && cc[1] >= y1 - 1) {
    cc[0] += xv;
    cc[1] += yv;
    if (xv < 0) {
      xv += 1;
    }
    if (xv > 0) {
      xv -= 1;
    }
    yv -= 1;
    if (cc[1] > top) top = cc[1];
    if (cc[0] >= x1 && cc[0] <= x2 && cc[1] >= y1 && cc[1] <= y2) {
      return top;
    }
  }
  return false;
}
let topmost = -Infinity;
let ans2 = 0;

for (let xv = 0; xv <= x2 + 1; ++xv) {
  for (let yv = -500; yv < 500; ++yv) {
    let av = sim(xv, yv);
    if (av !== false) {
      dbg([xv, yv]);
      ++ans2;
      if (av > topmost) {
        topmost = av;
      }
    }
  }
}
answer(1, topmost);
answer(2, ans2);
