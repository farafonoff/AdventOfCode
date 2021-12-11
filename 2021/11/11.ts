import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
import * as console from "console";
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
  [1, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
];
let ans1 = 0;
let total = contents.length * contents[0].length;
function step(data) {
  let inc1 = data.map((row) => row.map((v) => v + 1));
  let flashed = new HM();
  function flash(rid, cid) {
    if (flashed.has([rid, cid])) {
      return;
    }
    flashed.set([rid, cid], 1);
    adjm.forEach((av) => {
      let [dr, dc] = av;
      if (_.get(inc1, [rid + dr, cid + dc], false) === false) {
        return;
      }
      inc1[rid + dr][cid + dc]++;
      if (inc1[rid + dr][cid + dc] > 9) {
        flash(rid + dr, cid + dc);
      }
    });
  }
  inc1.forEach((row, rowid) => {
    row.forEach((col, colid) => {
      if (col > 9) {
        flash(rowid, colid);
      }
    });
  });
  ans1 += flashed.count();
  if (flashed.count() === total) {
    throw "sync!";
  }
  flashed.keys().forEach(([r, c]) => {
    inc1[r][c] = 0;
  });
  return inc1;
}
let cave = contents;
let animate = true;
let reset = "\x1b[0m";
let bright = "\x1b[1m";
let FgYellow = "\x1b[33m";
let FgWhite = "\x1b[37m";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function solve() {
  for (let st = 0; st < 10000000; ++st) {
    if (animate) {
      console.clear();
      let ws = cave.map((cl) => cl.join("")).join("\n");
      ws = ws.replace(/0/g, FgYellow + "0" + reset);
      console.log(ws);
      console.log(st + 1, ans1);
      await delay(150);
    }
    //
    try {
      cave = step(cave);
    } catch (sync) {
      console.log(st + 1);
      break;
    }
    if (st === 99) console.log(ans1);
    //console.log(st + 1, ans1);
  }
}

solve();
