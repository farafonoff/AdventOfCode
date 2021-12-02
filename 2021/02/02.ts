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
  .map((s) => s.split(" "))
  .map((ve) => ({ cmd: ve[0], prm: Number(ve[1]) }));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let depth = 0;
let x = 0;
contents.forEach((line) => {
  switch (line.cmd) {
    case "forward":
      x += line.prm;
      break;
    case "up":
      depth -= line.prm;
      break;
    case "down":
      depth += line.prm;
      break;
  }
});

console.log(x, depth, x * depth);

depth = 0;
x = 0;
let aim = 0;
contents.forEach((line) => {
  switch (line.cmd) {
    case "forward":
      x += line.prm;
      depth += line.prm * aim;
      break;
    case "up":
      aim -= line.prm;
      break;
    case "down":
      aim += line.prm;
      break;
  }
});

console.log(x, depth, x * depth);
