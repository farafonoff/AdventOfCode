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
  .filter((s) => s.length > 0)
  .map((s) => s.split("").map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let buttons = [
  "",
  "",
  "abc",
  "def",
  "ghi",
  "jkl",
  "mno",
  "pqrs",
  "tuv",
  "wxyz",
].map((ss) => ss.split(""));
dbg(buttons);
contents.forEach((line) => {
  let dd = line.reduce(
    (pv, cv) => {
      if (pv.rch === cv) {
        pv.rep++;
      } else {
        if (pv.rep) {
          pv.data.push([pv.rch, pv.rep]);
        }
        pv.rch = cv;
        pv.rep = 1;
      }
      return pv;
    },
    {
      data: [],
      rch: null,
      rep: 0,
    }
  );
  dd.data.push([dd.rch, dd.rep]);
  let prepared = dd.data;
  //dbg(prepared);
  let result = prepared.reduce((pv, cv) => {
    let [cbtn, count] = cv;
    let charz = buttons[cbtn];
    let rema = count % charz.length;
    let divi = (count - rema) / charz.length;
    if (rema > 0) {
      pv.push(charz[rema - 1]);
    }
    if (divi > 0) {
      pv.push(_.repeat(_.last(charz), divi));
    }
    return pv;
  }, []);
  dbg(result.join("").toUpperCase());
});
