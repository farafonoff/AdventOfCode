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
let crabs = contents[0];
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content

crabs.sort((a, b) => a - b);

let len = crabs.length;
let med;
if (len % 2 === 0) {
  med = (crabs[len / 2 - 1] + crabs[len / 2]) / 2;
} else {
  med = crabs[(len - 1) / 2];
}

let fuelz = crabs.map((c) => Math.abs(c - med)).reduce((pv, cv) => pv + cv, 0);
console.log(fuelz);

let sums = [0];
for (let ss = 1; ss < 100000; ++ss) {
  sums.push(_.last(sums) + ss);
}
//console.log(sums);

let min = crabs[0];
let max = _.last(crabs);
let minff = Infinity;
let rpos = 0;
for (let pos = min; pos < max; ++pos) {
  let fuelz = crabs
    .map((c) => Math.abs(c - pos))
    .map((pd) => sums[pd])
    .reduce((pv, cv) => pv + cv, 0);
  if (fuelz < minff) {
    minff = fuelz;
    rpos = pos;
  }
}
console.log(minff);
