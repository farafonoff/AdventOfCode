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
function hash(str: string) {
  let acc = 0;
  for(let i=0;i<str.length;++i) {
    let ch = str.charCodeAt(i)
    acc=(acc+ch)*17%256;
  }
  return acc;
}
function s2(tokens: string[]) {
  let boxes = [];
  tokens.forEach(tok => {
    if (tok.indexOf('=')!==-1) {
      let [label, value] = tok.split('=')
      let hs = hash(label)
      boxes[hs] = boxes[hs] || [];
      let oldIndex = boxes[hs].findIndex(arr => arr[0]===label)
      if (oldIndex === -1) {
        boxes[hs].push([label, value])
      } else {
        boxes[hs].splice(oldIndex, 1, [label, value])
      }
    } else {
      if (tok.indexOf('-')!==-1) {
        let [label, value] = tok.split('-')
        let hs = hash(label)
        boxes[hs] = boxes[hs] || [];
        boxes[hs] = boxes[hs].filter(arr => arr[0]!==label)
      }
    }
  })
  let fv = 0;
  for(let i=0;i<256;++i) {
    let bb = boxes[i] || [];
    bb.forEach((lens, idx) => {
      fv += (i+1)*(idx+1)*lens[1]
    })
  }
  return fv;
}
contents.forEach((line) => {
  let tokens = line.split(',')
  let hashes = tokens.map(hash)
  answer(1, hashes.reduce((a,b) => a+b))
  answer(2, s2(tokens))
});
