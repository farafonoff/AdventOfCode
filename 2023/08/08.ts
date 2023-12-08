import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
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
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let instr = contents[0].split('')
let map = {}
contents.slice(1).forEach((line) => {
  let [node, eeeeq, left, right] = line.split(' ');
  left = left.substring(1, left.length - 1)
  right = right.substring(0, right.length - 1)
  dbg([node, left, right])
  map[node] = [left, right]
});

function s1() {
  let mnode = 'AAA'
  for(let step = 0; step < Infinity; ++step) {
    dbg(mnode)
    if (mnode === 'ZZZ') {
      return [step]
    }
    const turn = instr[step%instr.length]
    switch(turn) {
      case 'R': mnode = map[mnode][1]; break;
      case 'L': mnode = map[mnode][0]; break;
    }
  }
}

function s2(snode): any {
  let mnode = snode
  const visited = new HM();
  for(let step = 0; step < Infinity; ++step) {
    //dbg(mnode)
    visited.set(mnode, step)
    const turn = instr[step%instr.length]
    switch(turn) {
      case 'R': mnode = map[mnode][1]; break;
      case 'L': mnode = map[mnode][0]; break;
    }
    if (visited.has(mnode) && mnode.endsWith('Z')) {
      dbg(mnode)
      return [visited.get(mnode), step]
    }
  }
}

answer(1, s1()[0])

const loopz = []
Object.keys(map).forEach((key) => {
  if (key.endsWith('A')) {
    let [loops, loope] = s2(key);
    const loopl = loope - loops;
    dbg([key, loops, loope, loopl])
    loopz.push(loops)
  }
})


// Функция для нахождения НОД двух чисел
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

// Функция для нахождения НОД массива чисел
function arrayGCD(arr) {
  let result = arr[0];
  for (let i = 1; i < arr.length; i++) {
      result = gcd(result, arr[i]);
  }
  return result;
}

// Функция для нахождения НОК двух чисел
function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

// Функция для нахождения НОК массива чисел
function arrayLCM(arr) {
  let result = arr[0];
  for (let i = 1; i < arr.length; i++) {
      result = lcm(result, arr[i]);
  }
  return result;
}

const ans2 = arrayLCM(loopz)

answer(2, ans2)