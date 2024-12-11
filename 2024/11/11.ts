import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
const infile = process.argv[2] || "input";

function cached<T extends Function>(fn: T): T {
  const cache = new HM();
  function inner() {
    let key = [...arguments];
    if (cache.has(key)) {
      return cache.get(key)
    }
    let res = fn(...arguments)
    cache.set(key, res)
    return res;
  }
  return inner as any;
}

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

const up = ([a,b]) => [a-1, b];
const down = ([a,b]) => [a+1, b];
const left = ([a,b]) => [a, b-1];
const right = ([a,b]) => [a, b+1];
const dirs = [up, down, left, right]

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
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let stones = [];
contents.forEach((line) => {
  stones = line.split(" ").map(Number);
});

dbg(stones)

function blink(stone) {
  if (stone === 0) return [1];
  let ss = String(stone);
  if (ss.length % 2 === 0) {
    return [Number(ss.slice(0, ss.length / 2)), Number(ss.slice(ss.length / 2))];
  }
  return [stone*2024];
}

let ans1 = 0;
stones.forEach((stone) => {
  ans1 += expand(25, stone).length;
});

answer(1, ans1);

function expand(count, stone) {
  let stonez = [stone];
  for (let it = 0; it < count; ++it) {
    stonez = stonez.flatMap(blink)
  }
  return stonez;
}

function solve2() {
  let stoneTab = new Map();
  let myStones = [...stones];
  let cache = new Map();
  myStones.forEach((stone) => {
    if (!stoneTab.has(stone)) {
      stoneTab.set(stone, 1);
    } else {
      stoneTab.set(stone, stoneTab.get(stone) + 1);
    }
  });
  for(let top = 0; top < 75/5;++top) {
    dbg(`====== ${top} ======`);
    dbg(stoneTab.size)
    let nextMap = new Map();
    [...stoneTab.entries()].forEach(([stone, count]) => {
      let expanded = [];
      if (cache.has(stone)) {
        expanded = cache.get(stone);
      } else {
        expanded = expand(5, stone);
        cache.set(stone, expanded);
      }
      expanded.forEach((stone) => {
        if (!nextMap.has(stone)) {
          nextMap.set(stone, count);
        } else {
          nextMap.set(stone, nextMap.get(stone) + count);
        }
      });
    });
    stoneTab = nextMap;
  }
  let ans2 = 0;
  [...stoneTab.entries()].forEach(([stone, count]) => {
    ans2 += count;
  });
  answer(2, ans2);
  /*let line = [stones[1]].reverse();
  for (let it = 0; it < 75; ++it) {
    let stone = line.pop();
    let res = blink(stone);
    res.forEach((r) => {
      line.push(r);
    });
    dbg(line)
  }*/

}

solve2();