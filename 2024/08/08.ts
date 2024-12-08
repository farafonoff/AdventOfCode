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
let map = [];
let alphabet = new Set<string>();
let antennas = new Map<string, number[][]>();
contents.forEach((line, li) => {
  const ll = line.split('');
  map.push(ll);
  ll.forEach((c, ci) => {
    if (c!== '.') {
      alphabet.add(c)
      const oldAnt = antennas.get(c) || [];
      antennas.set(c, [...oldAnt, [li, ci]])
    }
  });
});

DEBUG = false;

dbg(alphabet)

dbg(antennas);

let antinodes = new HM<number[],string[]>();

alphabet.forEach((freq) => {
  let antenz = antennas.get(freq);
  dbg(antenz);
  for(let i=0;i<antenz.length;i++) {
    for(let j=0;j<antenz.length;j++) {
      if (i === j) {
        continue;
      }
      let [a, b] = antenz[i];
      let [c, d] = antenz[j];
      let vec = [c-a, d-b];
      let antinode = [a-vec[0], b-vec[1]];
      if (antinode[0] < 0 || antinode[1] < 0 || antinode[0] >= map.length || antinode[1] >= map[0].length) {
      } else {
        dbg(antinode);
        dbg(freq);
        let antnz = antinodes.get(antinode) || [];
        antinodes.set(antinode, [...antnz, freq]);
      }
    }
  }
});

function dbgAntinodes(antinodes) {
  let nm = [];
  for (let i = 0; i < map.length; i++) {
    let row = [];
    for (let j = 0; j < map[0].length; j++) {
      let an = ['#']// antinodes.get([i, j]);
      if (antinodes.get([i, j])) {
        row.push(an.join(''));
      } else {
        row.push('.');
      }
    }
    nm.push(row);
  }
  return nm;
}

function dbgMap(map) {
  map.forEach((row) => {
    console.log(row.join(''));
  });
}

//dbgMap(dbgAntinodes(antinodes));

answer(1, antinodes.count());

DEBUG = false;
let antinodes2 = new HM<number[],string[]>();

function gcd(a: number, b: number): number {
  if (!b) {
    return a;
  }
  return gcd(b, a % b);
}
let maxHarmonics = map.length;
alphabet.forEach((freq) => {
  let antenz = antennas.get(freq);
  dbg(antenz);
  for(let i=0;i<antenz.length;i++) {
    for(let j=0;j<antenz.length;j++) {
      if (i === j) {
        continue;
      }
      let [a, b] = antenz[i];
      let [c, d] = antenz[j];
      let vec = [c-a, d-b];
      let gcdv = gcd(Math.abs(vec[0]), Math.abs(vec[1]));
      vec = [vec[0]/gcdv, vec[1]/gcdv];
      for (let multi = -maxHarmonics; multi < maxHarmonics; multi++) {
        let antinode = [a - vec[0] * multi, b - vec[1] * multi];
        if (antinode[0] < 0 || antinode[1] < 0 || antinode[0] >= map.length || antinode[1] >= map[0].length) {
        } else {
          dbg(antinode);
          dbg(freq);
          let antnz = antinodes2.get(antinode) || [];
          antinodes2.set(antinode, [...antnz, freq]);
        }
      }
    }
  }
});

//dbgMap(dbgAntinodes(antinodes2));

answer(2, antinodes2.count());