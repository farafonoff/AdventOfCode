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
let mapline = /[#.O@]+/;
let cmdline = /[<v^>]+/;
let map = [];
let cmd = [];
let robopos = [];
contents.forEach((line) => {
  if (mapline.test(line)) {
    map.push(line.split(""));
  }
  if (line.indexOf("@") >= 0) { 
    robopos = [map.length - 1, line.indexOf("@")];
  }
  if (cmdline.test(line)) {
    cmd = [...cmd, ...line.split("")];
  }
});

function deepPush(map, pos, dir) {
  let dirf = dirs[["^", "v", "<", ">"].indexOf(dir)];
  let newpos = dirf(pos);
  let ch = _.get(map, pos);
  let obst = _.get(map, newpos);
  if (obst === '.') {
    _.set(map, pos, '.');
    _.set(map, newpos, ch);    
    return [newpos, true];
  }
  if (obst === '#') {
    return [pos, false];
  }
  if (obst === 'O') {
    let [, pushres] = deepPush(map, newpos, dir);
    if (pushres) {
      _.set(map, pos, '.');
      _.set(map, newpos, ch);
      return [newpos, true];
    } else {
      return [pos, false];
    }
  }
  return pos;
}

function printMap(map) {
  map.forEach((line) => {
    console.log(line.join(""));
  });
}

function calcGPS(map, findch = 'O') {
  let gps = 0;
  map.forEach((line, r) => {
    line.forEach((ch, c) => {
      if (ch === findch) {
        gps += r*100 + c;
      }
    });
  });
  return gps;
}

function runCommands(map, cmd, robopos) {
  let [r, c] = robopos;
  let pushed;
  cmd.forEach((dir) => {
    [[r, c], pushed] = deepPush(map, [r, c], dir);
  });
  printMap(map);
  return calcGPS(map, 'O');
}

DEBUG = false;

let a1 = runCommands(_.cloneDeep(map), cmd, robopos);
answer(1, a1);

function expandMap2(map) {
  let newmap = [];
  map.forEach((line, r) => {
    newmap.push(line.flatMap((ch, c) => {
      if (ch === '#') {
        return [ch, ch];
      }
      if (ch === '.') {
        return [ch, ch];
      }
      if (ch === 'O') {
        return ['[',']'];
      }
      if (ch === '@') {
        return [ch, '.'];
      }
    }))
  });
  return newmap;
}

function deepPush2(map, pos, dir) {
  let dirf = dirs[["^", "v", "<", ">"].indexOf(dir)];
  let newpos: any = dirf(pos);
  let ch = _.get(map, pos);
  let obst = _.get(map, newpos);
  if (obst === '.') {
    _.set(map, pos, '.');
    _.set(map, newpos, ch);    
    return [newpos, true];
  }
  if (obst === '#') {
    return [pos, false];
  }
  if (obst === ']' || obst === '[') {
    let othrebox = obst === ']' ? left(newpos) : right(newpos);
    dbg(newpos, "New pos");
    dbg(obst, "Obst");
    dbg(othrebox, "Other box");
    let pushres1, pushres2;
    [, pushres2] = deepPush2(map, othrebox, dir);
    dbg(pushres2, "Pushres2");
    if (pushres2) {
      [, pushres1] = deepPush2(map, newpos, dir);
    }
    if (pushres1 && pushres2) {
      _.set(map, pos, '.');
      _.set(map, newpos, ch);
      return [newpos, true];
    } else {
      return [pos, false];
    }
  }
  dbg("No match");
  return pos;
}

function runCommands2(map, cmd, robopos) {
  let [r, c] = robopos;
  let pushed;
  cmd.forEach((dir) => {
    let backup = _.cloneDeep(map);
    [[r, c], pushed] = deepPush2(map, [r, c], dir);
    if (!pushed) {
      map = backup;
    }
  });
  printMap(map);
  return calcGPS(map, '[');
}

let a2 = runCommands2(expandMap2(map), cmd, [robopos[0], robopos[1] * 2]);
answer(2, a2);