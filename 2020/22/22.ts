const fs = require("fs");
const HM = require("hashmap");
const md5 = require("js-md5");
const PQ = require("js-priority-queue");
const _ = require("lodash");
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
  .map(trnum)
  .filter(isFinite);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let pl1: number[] = contents.slice(0, Math.round(contents.length / 2));
let pl2: number[] = contents.slice(pl1.length);
console.log(pl1, pl2);

const opl1 = [...pl1];
const opl2 = [...pl2];

while (pl1.length && pl2.length) {
  let c1 = pl1.splice(0, 1)[0];
  let c2 = pl2.splice(0, 1)[0];
  if (c1 > c2) {
    pl1.push(c1);
    pl1.push(c2);
  } else {
    pl2.push(c2);
    pl2.push(c1);
  }
}

let winner = pl1.length ? pl1 : pl2;

let ans = winner.reverse().reduce((acc, val, idx) => {
  return acc + val * (idx + 1);
}, 0);

console.log(ans);

pl1 = opl1;
pl2 = opl2;

function checkRec(pl1, pl2, decks1, decks2) {
  let j1 = pl1.join(",");
  let j2 = pl2.join(",");
  if (decks1.get(j1) || decks2.get(j2)) {
    return 1;
  }
  decks1.set(j1, true);
  decks2.set(j2, true);
  return 0;
}

function rplay(pl1: number[], pl2: number[]): number {
  let decks1 = new Map();
  let decks2 = new Map();
  while (pl1.length && pl2.length) {
    if (checkRec(pl1, pl2, decks1, decks2)) {
      return 1;
    }
    let c1 = pl1.splice(0, 1)[0];
    let c2 = pl2.splice(0, 1)[0];
    if (c1 <= pl1.length && c2 <= pl2.length) {
      //rec
      let ss1 = pl1.slice(0, c1);
      let ss2 = pl2.slice(0, c2);
      let winner = rplay(ss1, ss2);
      if (winner == 1) {
        pl1.push(c1);
        pl1.push(c2);
      } else {
        pl2.push(c2);
        pl2.push(c1);
      }
    } else {
      if (c1 > c2) {
        pl1.push(c1);
        pl1.push(c2);
      } else {
        pl2.push(c2);
        pl2.push(c1);
      }
    }
  }
  if (pl1.length) return 1;
  if (pl2.length) return 2;
}

const rwinner = rplay(pl1, pl2);
let windeck;
if (rwinner == 1) {
  windeck = pl1;
} else {
  windeck = pl2;
}

console.log(
  windeck.reverse().reduce((acc, val, idx) => {
    return acc + val * (idx + 1);
  }, 0)
);
