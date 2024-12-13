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
type M = {
  A: [number, number];
  B: [number, number];
  prize: [number, number];
};
let machines: M[] = [];
let machine: M = {} as M;
let re = /Button (A|B): X\+(\d+), Y\+(\d+)/;
let pre = /Prize: X=(\d+), Y=(\d+)/;
contents.forEach((line) => {
  let match = line.match(re);
  if (match) {
    let [, name, x, y] = match;
    machine[name] = [Number(x), Number(y)];
  } else {
    let priz = line.match(pre);
    if (priz) {
      machine.prize = [Number(priz[1]), Number(priz[2])];
      machines.push(machine);
      machine = {} as M;
    }
  }
});

function solve11(machine) {
  for(let a=0; a<100; ++a) {
    for (let b=0;b<100;++b) {
      let x = a * machine.A[0] + b * machine.B[0];
      let y = a * machine.A[1] + b * machine.B[1];
      if (x == machine.prize[0] && y == machine.prize[1]) {
        return [a,b];
      }
    }
  }
}

function solve21(machine, increment = 0) {
  let [X1, X2] = [machine.A[0], machine.B[0]];
  let [Y1, Y2] = [machine.A[1], machine.B[1]];
  let [X, Y] = machine.prize.map(n => n + increment);
  let b = (X * Y2 - Y * X2) / (X1 * Y2 - Y1 * X2);
  let a = (X - X1 * b) / X2;
  if (Math.floor(a) !== a || Math.floor(b) !== b) {
    return undefined;
  }
  if (a < 0 || b < 0) {
    return undefined;
  }
  return [b, a];
}
let ans1 = 0;
machines.forEach((machine, i) => {
  //let res = solve11(machine);
  let res = solve21(machine);
  //dbg(res);
  dbg(res);
  if (res !== undefined) {
    ans1 += res[0] * 3 + res[1];
  }
});


answer(1, ans1);

let ans2 = 0;
machines.forEach((machine, i) => {
  //let res = solve11(machine);
  let res = solve21(machine, 10000000000000);
  //dbg(res);
  dbg(res);
  if (res !== undefined) {
    ans2 += res[0] * 3 + res[1];
  }
});

answer(2, ans2);