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
const task = [];
contents.forEach((line) => {
  const eq = line.split(': ');
  const [result, numbers] = [Number(eq[0]), eq[1].split(' ').map(Number)];
  task.push([result, numbers]);
});

function solve(result, acc, nums, idx, equation) {
  if (idx === nums.length) {
    if (acc === result) {
      dbg(equation);
    }
    return acc === result ? true: false;
  }
  if (acc > result) {
    return false;
  }
  const num = nums[idx];
  return solve(result, acc + num, nums, idx + 1, `${equation} + ${num}`) || solve(result, acc * num, nums, idx + 1, `${equation} * ${num}`);
}

function solve2(result, acc, nums, idx, equation) {
  if (idx === nums.length) {
    if (acc === result) {
      dbg(equation);
    }
    return acc === result ? true: false;
  }
  if (acc > result) {
    return false;
  }
  const num = nums[idx];
  return solve2(result, acc + num, nums, idx + 1, `${equation} + ${num}`) || solve2(result, acc * num, nums, idx + 1, `${equation} * ${num}`) || solve2(result, Number(String(acc) + String(num)), nums, idx + 1, `${equation} || ${num}`);
}

let ans1 = 0;

task.forEach(([result, nums]) => {
  const solvable = solve(result, nums[0], nums, 1, `${result} = ${nums[0]}`);
  if (solvable) {
    ans1 += result;
  }
});

answer(1, ans1);

let ans2 = 0;

task.forEach(([result, nums]) => {
  const solvable = solve2(result, nums[0], nums, 1, `${result} = ${nums[0]}`);
  if (solvable) {
    ans2 += result;
  }
});

answer(2, ans2);