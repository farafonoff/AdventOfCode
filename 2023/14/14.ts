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
let map = []
contents.forEach((line) => {
  map.push(line.split(''))
});

function tiltN(map) {
  for(let col = 0;col<map[0].length;++col) {
    for(let row = 0;row<map.length;++row) {
      if (map[row][col] === 'O') {
        let rp = row;
        map[rp][col] = '.'
        while (_.get(map, [rp, col])==='.') {
          --rp;
        }
        ++rp;
        map[rp][col]='O'
      }
    }
  }
}

function tiltS(map) {
  for(let col = 0;col<map[0].length;++col) {
    for(let row = map.length-1;row>=0;--row) {
      if (map[row][col] === 'O') {
        let rp = row;
        map[rp][col] = '.'
        while (_.get(map, [rp, col])==='.') {
          ++rp;
        }
        --rp;
        map[rp][col]='O'
      }
    }
  }
}

function tiltW(map) {
  for(let col = 0;col<map[0].length;++col) {
    for(let row = 0;row<map.length;++row) {
      if (map[row][col] === 'O') {
        let cp = col;
        map[row][cp] = '.'
        while (_.get(map, [row, cp])==='.') {
          --cp;
        }
        ++cp;
        map[row][cp]='O'
      }
    }
  }
}

function tiltE(map) {
  for(let col = map[0].length-1;col>=0;--col) {
    for(let row = 0;row<map.length;++row) {
      if (map[row][col] === 'O') {
        let cp = col;
        map[row][cp] = '.'
        while (_.get(map, [row, cp])==='.') {
          ++cp;
        }
        --cp;
        map[row][cp]='O'
      }
    }
  }
}

function momentN(map) {
  let moment = 0;
  for(let col = 0;col<map[0].length;++col) {
    for(let row = 0;row<map.length;++row) {
      let arm = map.length - row;
      if (map[row][col] === 'O') {
        moment += arm;
      }
    }
  }
  return moment;
}
DEBUG=false
//map.map(r => r.join('')).forEach(r => dbg(r))
let orig = _.cloneDeep(map)
tiltN(map)
map.map(r => r.join('')).forEach(r => dbg(r))
answer(1, momentN(map))
map = _.cloneDeep(orig)
let history = new HM<any, number>();
let i = 0 ;
let loopS = 0, loopL = 0;
for(i=0;i<1000000000;++i) {
  tiltN(map)
  //dbg(i, 'TILTN')
  //map.map(r => r.join('')).forEach(r => dbg(r))
  tiltW(map)
  //dbg(i, 'TILTW')
  //map.map(r => r.join('')).forEach(r => dbg(r))
  tiltS(map)
  //dbg(i, 'TILTS')
  //map.map(r => r.join('')).forEach(r => dbg(r))
  tiltE(map)
  //dbg(i, 'TILTE')
  //map.map(r => r.join('')).forEach(r => dbg(r))
  dbg(i+1, 'CYCLE')
  //map.map(r => r.join('')).forEach(r => dbg(r))
  if (!history.has(map)) {
    history.set(_.cloneDeep(map), i)
  } else {
    loopS = history.get(map);
    loopL = i-history.get(map);
    break;
  }
}
//answer(2, momentN(map))
dbg([loopS, loopL], 'LOOP')
let amln = (1000000000-1-loopS)%(loopL)+loopS
dbg(amln)
let entry = history.entries().find(en => en[1] === amln)
answer(2, momentN(entry[0]))
