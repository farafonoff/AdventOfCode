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
let ans1 = 0;
contents.forEach((line) => {
  const matches = line.matchAll(/mul\((\d+),(\d+)\)/g);
  const muls = [...matches].map(m => [m[0], trnum(m[1]), trnum(m[2]), Number(m[1]) * Number(m[2])]);
  muls.forEach(([orig, a, b, res]) => {
    ans1 += Number(res);
  });
});

answer(1, ans1);

let ans2 = 0;
let enabled = true;
contents.forEach((line) => {
  const matches = line.matchAll(/mul\((\d+),(\d+)\)|do\(\)|don't\(\)/g);
  const muls = [...matches].map(m => [m[0], trnum(m[1]), trnum(m[2]), Number(m[1]) * Number(m[2])]);
  dbg(muls);
  muls.forEach(([orig, a, b, res]) => {
    if (orig === "do()") {
      enabled = true;
    }
    if (orig === "don't()") {
      enabled = false;
    }
    if (enabled && String(orig).startsWith("mul")) {
      ans2 += Number(res);
    }
  });
});

answer(2, ans2);