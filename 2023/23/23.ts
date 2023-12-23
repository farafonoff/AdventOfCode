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

const up = ([a,b]) => [a-1, b];
const down = ([a,b]) => [a+1, b];
const left = ([a,b]) => [a, b-1];
const right = ([a,b]) => [a, b+1];
const dirs = [up, down, left, right]
const dirArrows = ['^', 'v', '<', '>']
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

let cols = map[0].length;
let rows = map.length;

let enter = [0, 1]
let exit = [rows-1, cols-2]

let findLongest = cached((sp, dir, visited) => {
  let pv = sp;
  let currentDir = dir;
  let mySteps = 0;
  let cv: any = dirs[currentDir](pv);
  while(true) {
    ++mySteps;
    let isEnd = _.isEqual(cv, exit)
    if (isEnd) { 
      dbg([sp, mySteps], 'END')
      return mySteps; 
    }
    let adjanceds = dirs.map((dr, dirId) => [dr(cv), dirId]);
    adjanceds = adjanceds.filter((ad: any) => {
      let chat = _.get(map, ad[0])
      return (chat !== '#' && (chat === '.' || chat === dirArrows[ad[1]]))
    })
    adjanceds = adjanceds.filter(ad => !_.isEqual(pv, ad[0]));
    if (adjanceds.length === 0) {
      return 0;
    }
    if (adjanceds.length === 1) {
      [pv, cv] = [cv, adjanceds[0][0]]
    } else {
      dbg(adjanceds.map(ad => [_.get(map, ad[0]), ad[1]] ))
      dbg([pv, cv, mySteps])
      let longestDownPath = 0;
      adjanceds.forEach(adj => {
        let downPath = findLongest(cv, adj[1], [...visited, cv]);
        dbg([cv, adj, downPath, longestDownPath])
        longestDownPath = Math.max(longestDownPath, downPath)
      })
      if (longestDownPath > 0) {
        return mySteps + longestDownPath;
      }
      return 0;
    }
  }
})

DEBUG = false

let ans1 = findLongest(enter, 1, []);
answer(1, ans1)

DEBUG = false

let findNextCrossroad = cached((sp, dir) => {
  let pv = sp;
  let currentDir = dir;
  let mySteps = 0;
  let cv: any = dirs[currentDir](pv);
  while(true) {
    ++mySteps;
    let isEnd = _.isEqual(cv, exit)
    if (isEnd) { 
      return {cv: exit, mySteps, exit: true}; 
    }
    let adjanceds = dirs.map((dr, dirId) => [dr(cv), dirId]);
    adjanceds = adjanceds.filter((ad: any) => {
      let chat = _.get(map, ad[0])
      return (['.', ...dirArrows].includes(chat))
    })
    adjanceds = adjanceds.filter(ad => !_.isEqual(pv, ad[0]));
    if (adjanceds.length === 0) {
      return {cv, mySteps};
    }
    if (adjanceds.length === 1) {
      [pv, cv] = [cv, adjanceds[0][0]]
    } else {
      return {cv, mySteps}
    }
  }
})

let nodes = [enter, exit]
let edgesMap = [[findNextCrossroad(enter, 1) as any],[findNextCrossroad(exit, 0) as any]]
let edges = []
map.forEach((row, ri) => {
  row.forEach((col, ci) => {
    if (col !== '#') {
      let cv: any = [ri, ci];
      let adjanceds = dirs.map((dr, dirId) => [dr(cv), dirId]);
      adjanceds = adjanceds.filter((ad: any) => {
        let chat = _.get(map, ad[0])
        return (['.', ...dirArrows].includes(chat))
      })
      if (adjanceds.length > 2) {
        nodes.push(cv)
        let crossroads = [];
        adjanceds.forEach(adj => {
          let edge = findNextCrossroad(cv, adj[1])
          crossroads.push(edge)
          /*if (edge !== 0) {
            crossroads.push(edge)
          }*/
        })
        edgesMap[nodes.length-1] = crossroads;
      }
    }
  })
})

dbg(nodes)
edgesMap.forEach(eds => {
  let erow = []
  let onode = eds.map(ed => {
    let ni = nodes.findIndex(nod => _.isEqual(nod, ed.cv))
    if (ni === -1) {
      dbg(ed)
    }
    erow.push({ n: ni, l: ed.mySteps })
  });
  erow.sort((a,b) => b.l - a.l)
  edges.push(erow)
})
dbg(edges)
/*nodes.forEach((nod, ni) => {
  let eds = edges[ni]
  eds.forEach(ed => {
    console.log(`${ni} -- ${ed.n}`)
  })
})*/

const START = 0
const TARGET = 1

let maxLen = 0;

function fl2(nod, visited, tl) {
  let nexts = edges[nod];
  if (nod === TARGET) {
    maxLen = Math.max(tl, maxLen)
    dbg([tl, maxLen], 'END')
    return 0;
  }
  let maxSol = -1;
  nexts.forEach(nex => {
    if (!visited.includes(nex.n)) {
      visited.push(nex.n)
      let sol = fl2(nex.n, visited, tl + nex.l)
      visited.splice(visited.length - 1, 1)
      if (sol !== -1) {
        maxSol = Math.max(sol+nex.l, maxSol);
      }
    }
  })
  return maxSol;
}

answer(2, fl2(START, [], 0))

/*
let findLongest2 = cached((sp, dir, visited) => {
  let pv = sp;
  let currentDir = dir;
  let mySteps = 0;
  let cv: any = dirs[currentDir](pv);
  while(true) {
    ++mySteps;
    let isEnd = _.isEqual(cv, exit)
    if (isEnd) { 
      dbg([sp, mySteps], 'END')
      return mySteps; 
    }
    let adjanceds = dirs.map((dr, dirId) => [dr(cv), dirId]);
    adjanceds = adjanceds.filter((ad: any) => {
      let chat = _.get(map, ad[0])
      return (['.', ...dirArrows].includes(chat))
    })
    adjanceds = adjanceds.filter(ad => !_.isEqual(pv, ad[0]));
    dbg(adjanceds)
    if (adjanceds.length === 0) {
      return 0;
    }
    if (adjanceds.length === 1) {
      [pv, cv] = [cv, adjanceds[0][0]]
    } else {
      if (visited.find(vn => _.isEqual(vn, cv))) {
        return 0;
      }
      dbg(adjanceds.map(ad => [_.get(map, ad[0]), ad[1]] ))
      dbg([pv, cv, mySteps])
      let longestDownPath = 0;
      adjanceds.forEach(adj => {
        let downPath = findLongest2(cv, adj[1], [...visited, cv]);
        dbg([cv, adj, downPath, longestDownPath])
        longestDownPath = Math.max(longestDownPath, downPath)
      })
      if (longestDownPath > 0) {
        return mySteps + longestDownPath;
      }
      return 0;
    }
  }
})


let ans2 = findLongest2(enter, 1, []);
answer(2, ans2)

*/