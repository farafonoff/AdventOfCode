import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
import { setgid } from "process";
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
  .map((s) => s.split("|").map((part) => part.trim().split(" ")));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let ans1 = 0;
contents.forEach((line) => {
  let [left, right] = line;
  ans1 += right.filter((s) => [2, 4, 3, 7].includes(s.length)).length;
});

console.log(ans1);

let segs = "abcdefg".split("");
let permuts = [];
function build_perms(set, idx, arr) {
  if (set.length === 0) {
    permuts.push(arr);
  }
  set.forEach((sv) => {
    let a2 = [...arr, sv];
    build_perms(
      set.filter((sr) => sr !== sv),
      idx + 1,
      a2
    );
  });
}

let digits = [
  "abcefg",
  "cf",
  "acdeg",
  "acdfg",
  "bcdf",
  "abdfg",
  "abdefg",
  "acf",
  "abcdefg",
  "abcdfg",
].map((ds) => {
  let da = ds.split("");
  da.sort();
  return da.join("");
});
// console.log(digits);

build_perms(segs, 0, []);
function remap(digit, perm) {
  return digit.map((dv) => {
    let idx = segs.indexOf(dv);
    return perm[idx];
  });
}

let ans2 = 0;
contents.forEach((line, lnum) => {
  let [left, right] = line;
  let validd = permuts.filter((permut) => {
    let mismatch = 0;
    left.forEach((lv) => {
      let fixed = remap(lv.split(""), permut);
      fixed.sort();
      let cv = fixed.join("");
      let dv = digits.indexOf(cv);
      if (dv === -1) {
        mismatch++;
      }
    });
    if (mismatch !== 0) {
      return false;
    }
    return true;
  });
  if (validd.length > 1) console.log("BROKEN LINE");
  //console.log(validd[0]);
  let rd = right.map((rv) => {
    let fixed = remap(rv.split(""), validd[0]);
    fixed.sort();
    let cv = fixed.join("");
    let dv = digits.indexOf(cv);
    return dv;
  });
  let rv = parseInt(rd.join(""), 10);
  ans2 += rv;
  console.log(`decode line ${lnum} out of ${contents.length}`, rv);
});
console.log(ans2);
// 0: 6 abcefg
// !1: 2 cf
// 2: 5 acdeg
// 3: 5 acdfg
// !4: 4 bcdf
// 5: 5 abdfg
// 6: 6 abdefg
// !7: 3 acf
// !8: 7 abcdefg
// 9: 6 abcdfg
