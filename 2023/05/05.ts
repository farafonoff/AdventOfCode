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
let DEBUG = false;

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
let seeds;
let maps = [];
let targetmap;
let currentmap;
contents.forEach((line) => {
  const parts = line.split(' ').map(trnum)
  if (parts[0] ==='seeds:') seeds = parts.slice(1);
  if (parts[1] === 'map:') {
    targetmap = parts[0];
    currentmap = [];
    maps.push(currentmap);
  }
  if (isFinite(parts[0] as any)) {
    currentmap.push(parts)
  }
});

dbg(seeds);
dbg(maps)

let ans1 = Infinity;
seeds.forEach(seed => {
  const result = maps.reduce((seed, map) => {
    const nw = mapIt(seed, map)
    return nw;
  }, seed)
  if (result < ans1) {
    ans1 = result;
  }
})

function mapIt(vl, map) {
  let found = Infinity
  map.forEach((line, li) => {
    if (vl >= line[1] && vl <= line[1]+line[2]) {
      let mapped = line[0] + (vl - line[1]);
      if (mapped < found) found = mapped;
    }
  })
  if (!isFinite(found)) {
    found = vl;
  }
  return found;
}

function unmapIt(vl, map) {
  let found = []
  map.forEach((line, li) => {
    if (vl >= line[0] && vl <= line[0]+line[2]) {
      let mapped = line[1] + (vl - line[0]);
      found.push(mapped);
    }
  })
  if (found.length === 0) {
    found.push(vl);
  }
  return found;
}


answer(1, ans1);

function pois(map) {
  let res = [];
  map.forEach(ll => {
    res.push(ll[1])
    res.push(ll[1] + ll[2] + 1)
  })
  return res;
}

/* collect point of interest and map back to seed number */
let pv = [];
for(let i=maps.length-1;i>=0;--i) {
  let ps = pois(maps[i]);
  let newMap = _.flatten(pv.map(pv => unmapIt(pv, maps[i])))
  pv = [...newMap, ...ps]
}
for(let i=0;i<seeds.length;i+=2) {
  let [ss, sl] = [seeds[i],seeds[i+1]];
  pv.push(ss)
  pv.push(ss+sl+1)
}
pv.sort((a,b) => a-b)
pv = _.uniq(pv);
function hasSeed(val) {
  for(let i=0;i<seeds.length;i+=2) {
    let [ss, sl] = [seeds[i],seeds[i+1]];
    if (val >= ss && val <= ss+sl) {
      return true;
    }
  }
  return false;
}
let ans2 = Infinity;
pv.forEach((pvv) => {
  const result = maps.reduce((seed, map) => {
    const nw = mapIt(seed, map)
    return nw;
  }, pvv)
  if (hasSeed(pvv)) {
    if (result < ans2) {
      ans2 = result;
    }
  }
})

answer(2, ans2)
/*
let ans2 = Infinity;
for(let i=0;i<seeds.length;i+=2) {
  let [ss, sl] = [seeds[i],seeds[i+1]];
  for(let vv = ss; vv<=ss+sl;++vv) {
    const result = maps.reduce((seed, map) => {
      const nw = mapIt(seed, map)
      return nw;
    }, vv)
    if (result < ans2) {
      ans2 = result;
    }
  }
  dbg([i, ss, sl, ans2])
}
*/

/*
let ans2 = Infinity;
for(let i=seeds.length-2;i>=0;i-=2) {
  let [ss, sl] = [seeds[i],seeds[i+1]];
  for(let vv = ss; vv<=ss+sl;++vv) {
    const result = maps.reduce((seed, map) => {
      const nw = mapIt(seed, map)
      return nw;
    }, vv)
    if (result < ans2) {
      ans2 = result;
    }
  }
  dbg([i, ss, sl, ans2])
}
*/
