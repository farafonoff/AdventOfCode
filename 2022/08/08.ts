import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
import { LineAndCharacter } from "typescript";
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
  .filter((s) => s.length > 0)
  .map((s) => s.split("").map((s) => trnum(s) as number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let vis = new HM();
contents.forEach((line, ln) => {
  line.forEach((tr, tn) => {
    let isvs1 = true;
    for (let i = 0; i < tn; ++i) {
      if (contents[ln][i] >= tr) {
        isvs1 = false;
      }
    }
    let isvs2 = true;
    for (let i = line.length - 1; i > tn; --i) {
      if (contents[ln][i] >= tr) {
        isvs2 = false;
      }
    }

    let isvs3 = true;
    for (let i = 0; i < ln; ++i) {
      if (contents[i][tn] >= tr) {
        isvs3 = false;
      }
    }

    let isvs4 = true;
    for (let i = contents.length - 1; i > ln; --i) {
      if (contents[i][tn] >= tr) {
        isvs4 = false;
      }
    }
    if (isvs1 || isvs2 || isvs3 || isvs4) {
      vis.set([ln, tn], 1);
    }
  });
});

answer(1, vis.count());

let a2 = -Infinity;
contents.forEach((line, ln) => {
  line.forEach((tr, tn) => {
    let vd1 = 0;
    for (let i = tn - 1; i >= 0; --i) {
      if (contents[ln][i] < tr) {
        ++vd1;
      } else {
        ++vd1;
        break;
      }
    }
    let vd2 = 0;
    for (let i = tn + 1; i < line.length; ++i) {
      if (contents[ln][i] < tr) {
        ++vd2;
      } else {
        ++vd2;
        break;
      }
    }

    let vd3 = 0;
    for (let i = ln - 1; i >= 0; --i) {
      if (contents[i][tn] < tr) {
        ++vd3;
      } else {
        ++vd3;
        break;
      }
    }

    let vd4 = 0;
    for (let i = ln + 1; i < contents.length; ++i) {
      if (contents[i][tn] < tr) {
        ++vd4;
      } else {
        ++vd4;
        break;
      }
    }
    let vs = vd1 * vd2 * vd3 * vd4;
    a2 = Math.max(a2, vs);
  });
});

answer(2, a2);
