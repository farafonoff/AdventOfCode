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

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .map((s) => Number(s));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
function solve1(items) {
  let ans1 = 0;
  items.forEach((line, idx) => {
    if (idx > 0) {
      if (line > items[idx - 1]) {
        ++ans1;
      }
    }
  });
  return ans1;
}

console.log(solve1(contents));

let acc = 0;
let windows = [];
contents.forEach((line, idx) => {
  if (idx > 1) {
    windows.push(acc);
  }
  acc += line;
  if (idx > 2) {
    acc -= contents[idx - 3];
  }
});
console.log(solve1(windows));
