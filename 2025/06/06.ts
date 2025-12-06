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
  .filter((s) => s.length > 0);
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
const excel = [];
let tcols = 0;
contents.forEach((line) => {
  tcols = Math.max(line.length, tcols);
  excel.push(line.split(/[\s]+/).map(s => s.trim()).map(s => trnum(s)));
});
let res1 = [];
for(let i=0;i<excel.length-1;++i) {
  for(let j=0;j<excel[i].length;++j) {
    let op = excel[excel.length-1][j];
    if (op === '+') {
      let r = res1[j] || 0;
      r += excel[i][j] as number;
      res1[j] = r;
    }
    if (op === '*') {
      let r = res1[j] || 1;
      r *= excel[i][j] as number;
      res1[j] = r;
    }
  }
}
let ans1 = res1.reduce((a,b) => a + b, 0);
answer(1, ans1);

let numberRows = contents.slice(0, -1);
let operatorRow = contents[contents.length - 1];
let tempVals = [];
let answer2 = 0;

for (let i = tcols - 1; i >= 0; --i) {
  let cnum = [];
  numberRows.forEach((line) => {
    cnum.push(line.charAt(i));
  });
  let trimmed = cnum.join('').trim();
  if (trimmed.length === 0) {
    continue;
  }
  const cval = Number(trimmed);
  tempVals.push(cval);
  const op = operatorRow.charAt(i);
  if (op === '+') {
    answer2 += tempVals.reduce((a, b) => a + b, 0);
    tempVals = [];
  }
  if (op === '*') {
    answer2 += tempVals.reduce((a, b) => a * b, 1);
    tempVals = [];
  }
}
answer(2, answer2);