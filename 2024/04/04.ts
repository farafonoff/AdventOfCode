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

let wordsearch = [];

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
contents.forEach((line) => {
  const chars = line.split('');
  wordsearch.push(chars);
});

const xes = [];
const aes = [];
wordsearch.forEach((line, row) => {
  line.forEach((c, col) => {
    if (c === 'X') {
      xes.push([row, col]);    
    }
    if (c === 'A') {
      aes.push([row, col]);
    }    
  });
});

const dvs = [
  [1, 0],
  [0, 1],
  [1, 1],
  [-1, 0],
  [0, -1],
  [-1, -1],
  [1, -1],
  [-1, 1],
];

let count = 0;
const word = "XMAS";
xes.forEach(([row, col]) => {
  dvs.forEach(([dr, dc]) => {
    let chars = [];
    for(let i=0;i<word.length;i++) {
      chars.push(wordsearch[row + dr * i]?.[col + dc * i]);
    }
    chars.join('');
    if (chars.join('') === word) {
      ++count;
    }
  });
});

answer(1, count);

let count1 = 0;
const word1 = "MAS";
const diagonals = [
  [-1, -1],
  [-1, 1],
]
aes.forEach(([row, col]) => {
  let matches = 0;
  diagonals.forEach(([dr, dc]) => {
    let chars = [];
    for(let i=-1;i<2;++i) {
      chars.push(wordsearch[row + dr * i]?.[col + dc * i]);
    }
    const word = chars.join('');
    const rword = chars.reverse().join('');
    if (word === word1 || rword === word1) {
      ++matches;
    }
  });
  if (matches === 2) {
    ++count1;
  }
});

answer(2, count1);