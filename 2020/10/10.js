const fs = require("fs");
const HM = require("hashmap");
const md5 = require("js-md5");
const PQ = require("js-priority-queue");
const _ = require("lodash");
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
  .readFileSync("input", "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .map(Number);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
contents.push(0);
contents.sort((a, b) => a - b);
const diffs = [];
const ds = [];
contents.reduce((pv, cv) => {
  diffs[cv - pv] = diffs[cv - pv] + 1 || 1;
  ds.push(cv - pv);
  return cv;
});
diffs[1];
diffs[3]++;
console.log(diffs[1] * diffs[3]);
ds.push(3);
console.log(ds);
let dynam = [];
dynam[0] = 1;
console.log(contents);
contents.forEach((cn) => {
  if (cn > 0) {
    dynam[cn] =
      (dynam[cn - 1] || 0) + (dynam[cn - 2] || 0) + (dynam[cn - 3] || 0);
  }
});
console.log(dynam[dynam.length - 1]);
