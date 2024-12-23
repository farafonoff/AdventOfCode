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

/*var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);*/
var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/\s+/).map(Number));
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let safe = 0;
contents.forEach((line) => {
  const vector = line[1] - line[0];
  let isSafe = true;
  dbg(vector);
  for (let i = 0; i < line.length - 1; i++) {
    const v2 = line[i + 1] - line[i];
    dbg(v2);
    if (v2 / vector > 0) {
      const modulo = Math.abs(v2);
      if (!(modulo >= 1 && modulo <= 3)) {
        isSafe = false;
      }
    } else {
      isSafe = false;
    }
  }
  dbg(isSafe);
  if (isSafe) {
    safe++;
  }
}
);

answer(1, safe);

let safe2 = 0;
contents.forEach((line) => {
  for (let skip = 0; skip < line.length; skip++) {
    const goods = line.filter((_, idx) => idx !== skip);
    const vector = goods[1] - goods[0];
    let isSafe = true;
    dbg(vector);
    for (let i = 0; i < goods.length - 1; i++) {
      const v2 = goods[i + 1] - goods[i];
      dbg(v2);
      if (v2 / vector > 0) {
        const modulo = Math.abs(v2);
        if (!(modulo >= 1 && modulo <= 3)) {
          isSafe = false;
        }
      } else {
        isSafe = false;
      }
    }
    dbg(isSafe);
    if (isSafe) {
      safe2++;
      break;
    }
  }
}
);

answer(2, safe2);