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
let diskMap = [];
let fileMap = [];
let spaceMap = [];
contents.forEach((line) => {
  diskMap = line.split("").map(c => Number(c));
});

diskMap.forEach((c, i) => {
  if (i % 2 === 0) {
    fileMap.push([i/2, c]);
  } else {
    spaceMap.push(c);
  }
});

DEBUG = false;

spaceMap.push(0);

const originalSpaceMap = [...spaceMap];
const originalFileMap = [...fileMap];

dbg(fileMap);

let mergeFiles = [...fileMap].reverse();

dbg(mergeFiles);

let insertPos = 0;
let resultMap = [fileMap[0]];
mergeFiles.forEach((f, i) => {
  let [idx, file] = f;
  let tfile = file;
  dbg({f, idx, tfile, insertPos});
  while(tfile > 0 && insertPos < idx) {
    let nSpace = spaceMap[insertPos];
    if (nSpace === 0) {
      let nextFile = fileMap[insertPos+1];
      if (nextFile[0] < idx) {
        resultMap.push(fileMap[insertPos+1]);
        insertPos++;  
      } else {
        resultMap.push([idx, tfile]);
        insertPos++;
      }
    } else {
      let iv = Math.min(nSpace, tfile);
      tfile -= iv;
      nSpace -= iv;
      resultMap.push([idx, iv]);
      spaceMap[spaceMap.length - 1] += nSpace;
      spaceMap[insertPos] = nSpace;
    }
  }
  dbg(resultMap);
  dbg(spaceMap)
});

dbg(resultMap);

function checkSum(map) {
  let sum = 0;
  let position = 0;
  map.forEach((f, i) => {
    let [id, length] = f;
    for(let j=0;j<length;j++) {
      sum += id * position;
      ++position;
    }
  });
  return sum;
}

answer(1, checkSum(resultMap));

DEBUG = false;

function solve2(fileMap, spaceMap) {
  dbg(fileMap);
  dbg(spaceMap);
  let reversed = _.cloneDeep(fileMap).reverse();
  let spanMap = fileMap.map((f, i) => {
    return [f];
  });
  let spaceIndex = spaceMap.map((s, i) => {
    return [i, s];
  })
  dbg(spaceIndex);
  dbg(spanMap);
  function findSpot(file) {
    return spaceIndex.findIndex((s, i) => {
      let [idx, space] = s;
      if (space >= file) {
        return true;
      }
    });
  };
  reversed.forEach((f, i) => {
    let [idx, file] = f;
    let si = findSpot(file);
    if (si>=0 && si < idx) {
      let [spaceIdx, space] = spaceIndex[si];
      space -= file;
      spaceIndex[si] = [spaceIdx, space];
      spanMap[spaceIdx].push([idx, file]);
      spanMap[idx] = spanMap[idx].filter((f) => f[0] !== idx);
      spaceIndex[idx-1][1] += file;
    }
  });

  function checkSum() {
    let sum = 0;
    let position = 0;
    spanMap.forEach((span, i) => {
      span.forEach((file) => {
        let [id, length] = file;
        for(let j=0;j<length;j++) {
          sum += id * position;
          ++position;
        }
      })
      position += spaceIndex[i][1];
    });
    return sum;
  }
  return checkSum();
}

answer(2, solve2(originalFileMap, originalSpaceMap));