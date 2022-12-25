import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _, { isNumber } from "lodash";
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
let pow5 = [];
for (let i = 0; i < 22; ++i) {
  pow5.push(5 ** i);
}

function snfToDec(str) {
  let result = 0;
  [...str].reverse().forEach((ch, idx) => {
    let nmch = trnum(ch);
    if (isNumber(nmch)) {
      result += pow5[idx] * nmch;
    } else {
      switch (nmch) {
        case "-": {
          result -= pow5[idx];
          break;
        }
        case "=": {
          result -= 2 * pow5[idx];
          break;
        }
      }
    }
  });
  return result;
}
let offset = [];
for (let i = 0; i < 22; ++i) {
  offset.push("2");
}
function decToSnf(num) {
  let boffset = parseInt(offset.join(""), 5);
  let offed = num + boffset;
  let numbr = offed.toString(5);
  let lz = true;
  let resNr = [];
  [...numbr].forEach((ch) => {
    let nch = Number(ch);
    if (nch === 2 && lz) {
      return;
    } else {
      lz = false;
    }
    let vl = ch - 2;
    if (vl >= 0) {
      resNr.push(String(vl));
    } else {
      switch (vl) {
        case -1:
          resNr.push("-");
          break;
        case -2:
          resNr.push("=");
          break;
      }
    }
  });
  return resNr.join("");
}
let a1 = 0;
contents.forEach((line) => {
  a1 += snfToDec(line);
});

answer(1, decToSnf(a1));
