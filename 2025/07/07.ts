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
let mapa = [];
let scol = -1;
contents.forEach((line) => {
  let lsplit = line.split('');
  mapa.push(lsplit);
  if (scol === -1) {
    scol = lsplit.indexOf('S');
  }
});
let bemap = new HM<number, number>();
bemap.set(scol, 1);
let ans1 = 0;
mapa.forEach(mrow => {
  let splitters = mrow.reduce((acc, val, idx) => {
    if (val === '^') {
      acc.push(idx);
    }
    return acc;
  }, []);
  splitters.forEach(sp => {
    if (bemap.has(sp)) {
      ++ans1;
      let beamValue = bemap.get(sp);
      bemap.delete(sp);
      let ovl = bemap.get(sp - 1) || 0;
      let ovr = bemap.get(sp + 1) || 0;
      bemap.set(sp - 1, ovl + beamValue);
      bemap.set(sp + 1, ovr + beamValue);
    }
  });
})

answer(1, ans1);
let ans2 = bemap.values().reduce((a,b) => a + b, 0);
answer(2, ans2);