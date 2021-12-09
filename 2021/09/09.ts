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
  .map((s) => s.split("").map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let adjm = [
  [-1, 0],
  [1, 0],
  [0, 1],
  [0, -1],
];
let ans1 = 0;
let lops = [];
contents.forEach((line, idx) => {
  line.forEach((cell, cidx) => {
    let values = adjm.map((adj) => {
      return _.get(contents, [idx + adj[0], cidx + adj[1]], Infinity);
    });
    let lvals = values.filter((lv) => lv <= cell);
    if (lvals.length === 0) {
      ans1 += 1 + cell;
      lops.push([idx, cidx]);
    }
  });
});
console.log(ans1);

function flood(sp: number[], fidx: number) {
  let [idx, cidx] = sp;
  _.set(contents, [idx, cidx], -fidx);
  adjm.forEach((adj) => {
    let av = _.get(contents, [idx + adj[0], cidx + adj[1]], Infinity);
    if (av < 9 && av >= 0) {
      flood([idx + adj[0], cidx + adj[1]], fidx);
    }
  });
}

lops.forEach((lop, lidx) => {
  if (_.get(contents, lop, -1) >= 0) {
    flood(lop, lidx + 1);
  }
});

let basins = new HM();

contents.forEach((line, idx) => {
  line.forEach((cell, cidx) => {
    if (cell < 0) {
      let bi = -cell;
      if (basins.has(bi)) {
        let bs = basins.get(bi) as number;
        basins.set(bi, bs + 1);
      } else {
        basins.set(bi, 1);
      }
    }
  });
});

let av2 = basins.values() as number[];
av2.sort((a, b) => b - a);
let ans2 = av2[0] * av2[1] * av2[2];

console.log(ans2);
