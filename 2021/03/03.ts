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
  .map((s) => s.split(""));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let countz = contents[0].map((v) => 0);
contents.forEach((line) => {
  line.forEach((bit, idx) => (countz[idx] += bit === "1" ? 1 : 0));
});
let tot = contents.length;
let eps = countz.map((v) => (tot - v > v ? 1 : 0)).join("");
let gam = countz.map((v) => (tot - v > v ? 0 : 1)).join("");
let ev = parseInt(eps, 2);
let gv = parseInt(gam, 2);
console.log(gv, ev, ev * gv);

function filtr(contents, most, bit) {
  let countz = contents[0].map((v) => 0);
  contents.forEach((line) => {
    line.forEach((bit, idx) => (countz[idx] += bit === "1" ? 1 : 0));
  });
  let tot = contents.length;
  let fv = tot - countz[bit] <= countz[bit] ? 1 : 0;
  if (!most) {
    fv = 1 - fv;
  }
  return contents.filter((cv) => {
    return cv[bit] === String(fv);
  });
}

let cont1 = [...contents];
let bit = 0;
while (cont1.length > 1) {
  cont1 = filtr(cont1, true, bit);
  ++bit;
}

let cont2 = [...contents];
bit = 0;
while (cont2.length > 1) {
  cont2 = filtr(cont2, false, bit);
  ++bit;
}

let o2 = parseInt(cont1[0].join(""), 2);
let co2 = parseInt(cont2[0].join(""), 2);

console.log(o2, co2, o2 * co2);
