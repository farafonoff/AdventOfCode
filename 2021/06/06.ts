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
  .map((s) => s.split(",").map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let fishs = contents[0];
fishs.sort((a, b) => a - b);
let fishnum = [];
for (let fn = 0; fn < 9; ++fn) fishnum[fn] = 0;
fishs.forEach((fv) => fishnum[fv]++);
const checkpoints = [80, 256];
for (let cd = 0; cd < 256; ++cd) {
  let fn2 = fishnum.map((fc, fv) => {
    return fishnum[fv + 1];
  });
  fn2[8] = fishnum[0];
  fn2[6] += fishnum[0];
  fishnum = fn2;
  let sum = fishnum.reduce((pv, cv) => pv + cv, 0);
  if (checkpoints.includes(cd + 1)) {
    console.log(cd + 1, sum);
  }
}
