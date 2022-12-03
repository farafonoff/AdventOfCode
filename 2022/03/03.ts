import { log } from "console";
import { setServers } from "dns";
import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
const infile = process.argv[2] || "input";

function trnum(val: string): number | string {
  let nn = Number(val);
  if (val !== "" && isFinite(nn)) {
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

function incHM(tab: HM<unknown, number>, key: unknown, inc: number, dv = 0) {
  let ov = tab.get(key) || dv;
  tab.set(key, ov + inc);
}
let DEBUG = true;

function dbg(expression: any, message: string = ""): any {
  if (!DEBUG) {
    return expression;
  }
  if (message) {
    console.log(message, expression);
  } else {
    console.log(expression);
  }
  return expression;
}

function answer(part, value) {
  console.log(`Answer ${part}: ${value}`);
}

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
const ac = "a".charCodeAt(0);
const zc = "z".charCodeAt(0);
const Ac = "A".charCodeAt(0);
const Zc = "Z".charCodeAt(0);

let prio = (s: string) => {
  let cd = s.charCodeAt(0);
  if (cd >= ac && cd <= zc) {
    return cd - ac + 1;
  }
  return cd - Ac + 27;
};
let s1 = 0;
let intersect = (s1, s2) => {
  let [fp, sp] = [s1.split(""), s2.split("")].map((arr) => new Set(arr));
  let common = [];
  for (let entry of fp.entries()) {
    if (sp.has(entry[0])) {
      common.push(entry[0]);
    }
  }
  return common;
};
contents.forEach((line) => {
  let itemz = line.split("");
  let [fp, sp] = [
    itemz.slice(0, itemz.length / 2),
    itemz.slice(itemz.length / 2),
  ].map((arr) => new Set(arr));
  //log(fp, sp);
  let common;
  for (let entry of fp.entries()) {
    if (sp.has(entry[0])) {
      common = entry[0];
    }
  }
  s1 += prio(common);
  //log(common, prio(common));
});
answer(1, s1);

let s = 0;
for (let gn = 0; gn < contents.length; gn += 3) {
  let ii = intersect(
    intersect(contents[gn], contents[gn + 1]).join(""),
    contents[gn + 2]
  );
  s += prio(ii[0]);
}
answer(2, s);
