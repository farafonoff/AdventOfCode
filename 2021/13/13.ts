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

let dots = new HM<number[], number>();
let cmd = [];
var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .forEach((s) => {
    if (s.startsWith("fold")) {
      cmd.push(s.substr("fold along ".length).split("=").map(trnum));
    } else {
      dots.set(s.split(",").map(Number), 1);
    }
  });
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content

function fold(cd, dots: HM<number[], number>) {
  let res = new HM<number[], number>();
  if (cd[0] === "x") {
    dots.entries().forEach((val) => {
      let [x, y] = val[0];
      if (x > cd[1]) {
        let nc = [cd[1] - (x - cd[1]), y];
        let ov = res.get(nc) || 0;
        res.set(nc, ov + 1);
      } else {
        let nc = [x, y];
        let ov = res.get(nc) || 0;
        res.set(nc, ov + 1);
      }
    });
  }
  if (cd[0] === "y") {
    dots.entries().forEach((val) => {
      let [x, y] = val[0];
      if (y > cd[1]) {
        let nc = [x, cd[1] - (y - cd[1])];
        let ov = res.get(nc) || 0;
        res.set(nc, ov + 1);
      } else {
        let nc = [x, y];
        let ov = res.get(nc) || 0;
        res.set(nc, ov + 1);
      }
    });
  }
  return res;
}
console.log(fold(cmd[0], dots).count());

let p2m: HM<number[], number> = cmd.reduce((pv, cv) => {
  return fold(cv, pv);
}, dots);
let mass = [];
for (let i = 0; i < 8; ++i) {
  for (let j = 0; j < 50; ++j) {
    _.set(mass, [i, j], ".");
  }
}
p2m.keys().forEach((kk) => {
  _.set(mass, [kk[1], kk[0]], "#");
});

console.log(mass.map((rv) => rv.join("")).join("\n"));
