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

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);
let cfg = contents[0].split(" ").map(Number);
contents = contents.slice(1);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let START = "A".charCodeAt(0);
let END = "Z".charCodeAt(0);
let CHARS = [];
for (let char = START; char <= END; ++char) {
  CHARS.push(String.fromCharCode(char));
}
let result = [];
for (let i = 0; i < cfg[0]; ++i) {
  result.push([...CHARS]);
}

contents.forEach((line) => {
  let [pos, char] = line.split(" ");
  let arr = result[Number(pos) - 1];
  result[Number(pos) - 1] = arr.filter((arv) => arv !== char);
});

//dbg(result);
function med(arr) {
  if (arr.length % 2 === 1) {
    return arr[(arr.length - 1) / 2];
  }
  if (arr.length % 2 === 0) {
    return arr[arr.length / 2 - 1];
  }
}
dbg(med([0, 1, 2]));
dbg(med([0, 1, 2, 3]));
//dbg(result);
answer(1, result.map(med).join(""));
