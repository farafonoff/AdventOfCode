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

let rules = [];
let source = "";

fs.readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .forEach((s) => {
    if (s.indexOf("-") === -1) {
      source = s;
    } else {
      rules.push(s.split(" -> "));
    }
  });
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let pairs = source.split("").reduce((acc, cv, index, array) => {
  if (index > 0) {
    let pi = [array[index - 1], cv].join("");
    let ov = acc.get(pi) || 0;
    acc.set(pi, ov + 1);
  }
  return acc;
}, new HM<string, number>());
/*console.log(pairs);
rules.forEach((line) => {
  console.log(line);
});*/
function inc(tab: HM<unknown, number>, key: unknown, inc: number, dv = 0) {
  let ov = tab.get(key) || dv;
  tab.set(key, ov + inc);
}
function transform(src: HM<string, number>, rules) {
  let result = new HM<string, number>();
  rules.forEach((rp) => {
    let oldValue = src.get(rp[0]);
    if (oldValue > 0) {
      let parts = rp[0].split("");
      let newPairs = [
        [parts[0], rp[1]],
        [rp[1], parts[1]],
      ].map((pv) => pv.join(""));
      // console.log(rp[0], rp[1], newPairs);
      newPairs
        .map((pv) => result.get(pv) || 0)
        .forEach((val, index) => {
          result.set(newPairs[index], val + oldValue);
        });
    }
  });
  return result;
}
//console.log(pairs);
function solve(pairs, count) {
  let tv = pairs;
  for (let i = 0; i < count; ++i) {
    tv = transform(tv, rules);
  }
  let elCount = new HM<string, number>();

  tv.entries().forEach((ev) => {
    let pp = ev[0].split("");
    inc(elCount, pp[0], ev[1]);
    inc(elCount, pp[1], ev[1]);
  });
  inc(elCount, _.first(source.split("")), 1);
  inc(elCount, _.last(source.split("")), 1);
  let totCount = 0;
  let maxE = elCount.keys()[0],
    minE = elCount.keys()[0];
  elCount.entries().forEach((ev) => {
    elCount.set(ev[0], ev[1] / 2);
    totCount += elCount.get(ev[0]);
    if (elCount.get(ev[0]) > elCount.get(maxE)) {
      maxE = ev[0];
    }
    if (elCount.get(ev[0]) < elCount.get(minE)) {
      minE = ev[0];
    }
  });
  let ans1 = elCount.get(maxE) - elCount.get(minE);
  return ans1;
}

console.log(solve(pairs, 10));
console.log(solve(pairs, 40));
