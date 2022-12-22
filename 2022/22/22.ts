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

function vadd(v1, v2) {
  return v1.map((vc, vn) => vc + v2[vn]);
}

var contents = fs.readFileSync(infile, "utf8").split("\n");
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let map = contents.slice(0, -2).map((s) => s.split(""));
let route = contents.slice(-2, -1)[0];

let initial = [0, map[0].indexOf(".")];
let directions = [
  { ch: ">", ve: [0, 1] },
  { ch: "v", ve: [1, 0] },
  { ch: "<", ve: [0, -1] },
  { ch: "^", ve: [-1, 0] },
];

function solve1(map, initial, idir, route) {
  let mdbg = () => {
    map.forEach((row) => {
      dbg(row.join(""));
    });
  };
  let dir = idir;
  let pos = [...initial];
  let routeChars = route.split("");
  function walk(distance) {
    for (let i = 0; i < distance; ++i) {
      let next = vadd(pos, directions[dir].ve);
      dbg(vadd(next, [1, 1]));
      let nch = _.get(map, next, " ") as string;
      if (nch === " ") {
        ///wrap
        let wdir = (dir + 2) % directions.length;
        let wpos = [...pos];
        let pwpos = wpos;
        while (_.get(map, wpos, " ") !== " ") {
          pwpos = wpos;
          wpos = vadd(wpos, directions[wdir].ve);
        }
        next = pwpos;
      }
      nch = _.get(map, next, " ") as string;
      if (nch === "#") {
        return;
      }
      _.set(map, pos, directions[dir].ch);
      pos = next;
    }
  }

  while (routeChars.length > 0) {
    let dist = [];
    while (typeof trnum(routeChars[0]) === "number") {
      dist.push(routeChars.shift());
    }
    let distance = Number(dist.join(""));
    walk(distance);
    //mdbg();
    if (routeChars.length === 0) break;
    let rot = routeChars.shift();
    switch (rot) {
      case "R":
        ++dir;
        break;
      case "L":
        --dir;
        break;
    }
    if (dir < 0) dir += directions.length;
    dir = dir % directions.length;
  }
  mdbg();

  let apos = vadd(pos, [1, 1]);

  let answer1 = apos[0] * 1000 + apos[1] * 4 + dir;

  answer(1, answer1);
}

function solve2(map, initial, idir, route, SS = 50) {
  let mdbg = () => {
    map.forEach((row) => {
      dbg(row.join(""));
    });
  };
  let dir = idir;
  let pos = [...initial];
  let routeChars = route.split("");
  let segments = [
    [0, 2 * SS],
    [0, SS],
    [SS, SS],
    [2 * SS, SS],
    [2 * SS, 0],
    [3 * SS, 0],
  ];
  const ER = SS - 1;
  let wrmap = [
    [0, 0, 3, 2, ([r, c]) => [ER - r, ER]],
    [0, 1, 2, 2, ([r, c]) => [c, ER]],
    [0, 3, 5, 3, ([r, c]) => [ER, c]],
    [1, 3, 5, 0, ([r, c]) => [c, 0]],
    [1, 2, 4, 0, ([r, c]) => [ER - r, 0]],
    [2, 0, 0, 3, ([r, c]) => [ER, r]],
    [2, 2, 4, 1, ([r, c]) => [0, r]],
    [3, 0, 0, 2, ([r, c]) => [ER - r, ER]],
    [3, 1, 5, 2, ([r, c]) => [c, ER]],
    [4, 3, 2, 0, ([r, c]) => [c, 0]],
    [4, 2, 1, 0, ([r, c]) => [ER - r, 0]],
    [5, 0, 3, 3, ([r, c]) => [ER, r]],
    [5, 1, 0, 1, ([r, c]) => [0, c]],
    [5, 2, 1, 1, ([r, c]) => [0, r]],
  ];
  function mySegment(pos) {
    let res;
    segments.forEach((seg, idx) => {
      let sub = [pos[0] - seg[0], pos[1] - seg[1]];
      if (sub[0] >= 0 && sub[0] < 50 && sub[1] >= 0 && sub[1] < 50) {
        res = [idx, sub[0], sub[1]];
      }
    });
    return res;
  }
  function walk(distance) {
    for (let i = 0; i < distance; ++i) {
      let next = vadd(pos, directions[dir].ve);
      let nch = _.get(map, next, " ") as string;
      if (nch === " ") {
        ///wrap
        let seg = mySegment(pos);
        let nextSeg = wrmap.find((row) => row[0] === seg[0] && row[1] === dir);
        let ns = nextSeg[2] as number;
        let nextDir = nextSeg[3];
        let segPos = [seg[1], seg[2]];
        let nextSegPos = (nextSeg[4] as any)(segPos);
        //let nextPos = rot(dir, nextDir, segPos, SS);
        dbg([pos, seg[0], segPos, dir, ns, nextSegPos, nextDir]);
        next = vadd(nextSegPos, segments[ns]);
        nch = _.get(map, next, " ") as string;
        if (nch !== "#") {
          dir = nextDir;
        }
      }
      nch = _.get(map, next, " ") as string;
      if (nch === "#") {
        return;
      }
      _.set(map, pos, directions[dir].ch);
      pos = next;
    }
  }

  while (routeChars.length > 0) {
    let dist = [];
    while (typeof trnum(routeChars[0]) === "number") {
      dist.push(routeChars.shift());
    }
    let distance = Number(dist.join(""));
    walk(distance);
    //mdbg();
    if (routeChars.length === 0) break;
    let rot = routeChars.shift();
    switch (rot) {
      case "R":
        ++dir;
        break;
      case "L":
        --dir;
        break;
    }
    if (dir < 0) dir += directions.length;
    dir = dir % directions.length;
  }

  mdbg();

  let apos = vadd(pos, [1, 1]);

  let answer1 = apos[0] * 1000 + apos[1] * 4 + dir;

  answer(2, answer1);
}

DEBUG = false;
solve1(_.cloneDeep(map), [...initial], 0, route);
DEBUG = false;
solve2(_.cloneDeep(map), [...initial], 0, route);
