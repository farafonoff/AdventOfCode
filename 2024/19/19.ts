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
let towels = []
let designs = []

contents.forEach((line, idx) => {
  if (idx === 0) {
    towels = line.split(', ');
  }
  if (idx > 0) {
    designs.push(line)
  }
});

dbg(towels)
dbg(designs)

function solve(design: string, towels: string[]) {
  let cache = new Map();
  function recurse(slice:number) {
    if (cache.has(slice)) {
      return cache.get(slice);
    }
    let out = 0;
    let cdes = design.slice(slice);
    if (cdes === '') {
      return 1;
    }
    for(let towel of towels) {
      if (cdes === towel) {
        out += 1;
        continue;
      }
      if (cdes.startsWith(towel)) {
        let botAns = recurse(slice + towel.length)
        out += botAns;
      }
    }
    return out;
  }
  for(let i=design.length-1;i>=0;--i) {
    let tans = recurse(i);
    cache.set(i, tans)
  }
  return cache.get(0);
}
/*
function solved(design: string, towels: string[]) {
  let 
}*/

let ans1 = 0;
let ans2 = 0;
for(let des of designs) {
  let solvable = solve(des, towels);
  dbg({des, solvable})
  if (solvable) ans1++;
  ans2 += solvable;
}
answer(1, ans1);
answer(2, ans2);