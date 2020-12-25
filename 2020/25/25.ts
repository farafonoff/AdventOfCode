const fs = require("fs");
const HM = require("hashmap");
const md5 = require("js-md5");
const PQ = require("js-priority-queue");
const _ = require("lodash");
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
  .map(trnum);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content

let [cpk, dpk] = contents;
const GEN = 20201227;
function trn(sj, lpsz) {
  let res = 1;
  for (let i = 0; i < lpsz; ++i) {
    res *= sj;
    res = res % GEN;
  }
  return res;
}

function brute(sj, pubk) {
  let cv = 1;
  for (let i = 1; i < GEN + 1; ++i) {
    cv *= sj;
    cv = cv % GEN;
    if (cv === pubk) return i;
  }
}

/*
console.log(trn(7, 8));
console.log(trn(7, 11));
*/
let cprk = brute(7, cpk);
console.log(trn(dpk, cprk));
//let dprk = brute(7, dpk)
//console.log(brute(7, cpk));
//console.log(brute(7, dpk));
