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
  .map((s) => s.match(/(e|se|sw|s|sw|w|nw|ne)/g));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content

let vecs = {
  se: [0, 1],
  e: [1, 1],
  ne: [1, 0],
  nw: [0, -1],
  w: [-1, -1],
  sw: [-1, 0],
};

let map = new Map();
contents.forEach((line) => {
  let tpos = walk(line);
  let k = JSON.stringify(tpos);
  let vl = map.get(k) || -1;
  map.set(k, -vl);
});
let ans1 = 0;
map.forEach((val, key) => {
  if (val === 1) {
    ++ans1;
  }
});
console.log(ans1);

function va(pos1: number[], pos2: number[]) {
  return _.zip(pos1, pos2).map(([i, j]) => i + j);
}

function next(pos, dir) {
  return va(pos, vecs[dir]);
}

function walk(line) {
  let ipos = [0, 0];
  return line.reduce(next, ipos);
}

function expand(map: Map<string, number>) {
  let emap = new Map();
  map.forEach((val, key) => {
    const kpos = JSON.parse(key);
    emap.set(key, val);
    if (val === 1)
      _.forOwn(vecs, (vval, vkey) => {
        //console.log(vkey, vval, kpos);
        let nk = va(kpos, vval);
        let snk = JSON.stringify(nk);
        let nv = map.get(snk);
        //console.log(snk, nv);
        if (!nv) {
          emap.set(snk, -1);
        }
      });
  });
  return emap;
}

///console.log(map);
map = expand(map);
///console.log(map);

function nday(map: Map<string, number>) {
  map = expand(map);
  let res = new Map();
  map.forEach((val, key) => {
    const kpos = JSON.parse(key);
    let adjs = 0;
    _.forOwn(vecs, (vval, vkey) => {
      let nk = va(kpos, vval);
      let nv = map.get(JSON.stringify(nk));
      if (nv === 1) ++adjs;
    });
    res.set(key, val);
    if (val === 1) {
      if (adjs === 0 || adjs > 2) {
        res.set(key, -1);
      }
    } else {
      if (adjs === 2) {
        res.set(key, 1);
      }
    }
  });
  return res;
}

for (let day = 1; day <= 100; ++day) {
  map = nday(map);
  let a2 = 0;
  map.forEach((val, key) => {
    if (val === 1) ++a2;
  });
  //console.log(map);
  if (day % 10 === 0 && day === 100) {
    // console.log(day, a2);
    console.log(a2);
  }
  //break;
}
