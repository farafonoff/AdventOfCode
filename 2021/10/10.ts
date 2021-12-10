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
  .filter((s) => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let ans1 = 0;
let balls = {
  ")": 3,
  "]": 57,
  "}": 1197,
  ">": 25137,
};
let lines2 = contents
  .map((line) => {
    while (true) {
      let oline = line
        .replace("()", "")
        .replace("[]", "")
        .replace("{}", "")
        .replace("<>", "");
      if (oline === line) {
        let illeg = line.split("").find((ch) => {
          return [")", "]", "}", ">"].includes(ch);
        });
        if (illeg) {
          ans1 += balls[illeg];
          return false;
        }
        return oline;
      }
      line = oline;
    }
  })
  .filter((line) => line !== false);

console.log(ans1);
let balls2 = {
  "(": 1,
  "[": 2,
  "{": 3,
  "<": 4,
};
let ballz = lines2.map((line) => {
  let reversed = (line as string).split("").reverse();
  let val = 0;
  reversed.forEach((ch) => {
    val = val * 5 + balls2[ch];
  });
  return val;
});
ballz.sort((a, b) => a - b);
console.log(ballz[(ballz.length - 1) / 2]);
