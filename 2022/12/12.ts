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

const A = "a".codePointAt(0);

let ev = (ch: string) => ch.codePointAt(0) - A;

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .map((s) => s.split(""));
let H = contents.length;
let W = contents[0].length;

let S = [];
let E = [];
DEBUG = false;
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let starts = [];
contents.forEach((line, li) => {
  if (line.indexOf("S") !== -1) {
    S = [li, line.indexOf("S")];
    line[S[1]] = "a";
  }
  if (line.indexOf("E") !== -1) {
    E = [li, line.indexOf("E")];
    line[E[1]] = "z";
  }
  line.forEach((ev, idx) => {
    if (ev === "a") {
      starts.push([li, idx]);
    }
  });
});
dbg(starts);

function bfs(S, E) {
  let visited = new HM<unknown, number>();
  let queue = [S];
  visited.set(S, 0);
  while (queue.length) {
    let current = queue.shift();
    let cv = visited.get(current);
    const neighbors = [
      [current[0] - 1, current[1]],
      [current[0] + 1, current[1]],
      [current[0], current[1] - 1],
      [current[0], current[1] + 1],
    ].filter(([h, w]) => h >= 0 && h < H && w >= 0 && w < W);
    let currentE = ev(contents[current[0]][current[1]]);
    neighbors.forEach(([h, w]) => {
      let elv = ev(contents[h][w]);
      if (elv - currentE <= 1) {
        //dbg([current, cv, visited.get([h, w])]);
        if (!visited.has([h, w]) || visited.get([h, w]) > cv + 1) {
          queue.push([h, w]);
          //dbg([h, w, cv + 1]);
          visited.set([h, w], cv + 1);
        }
      }
    });
    //dbg(queue);
  }
  //dbg(queue);
  //dbg(visited);
  return visited.get(E);
}

answer(1, bfs(S, E));
let min = Infinity;
starts.forEach((start) => {
  let path = bfs(start, E);
  if (path) {
    dbg([start, path]);
    min = Math.min(min, path);
  }
});
answer(2, min);
