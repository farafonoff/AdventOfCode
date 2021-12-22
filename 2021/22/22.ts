import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _, { isNumber } from "lodash";
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

/*var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);*/
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
// on x=-35..19,y=-9..37,z=-14..39
var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .map((s) =>
    s
      .match(
        /(\w+) x=(-?\d+)\.\.(-?\d+),y=(-?\d+)\.\.(-?\d+),z=(-?\d+)\.\.(-?\d+)/
      )
      .slice(1)
  )
  .map((rr) => ({ op: rr[0], cub: rr.slice(1).map(Number) })); // [orig, g1, g2 ...] = content
let map1 = new HM();
let data1 = contents.filter((row) => {
  return !_.some(row.cub, (rv) => Math.abs(rv) > 50);
});

data1.forEach((row) => {
  let val = row.op === "on" ? 1 : 0;
  for (let x = row.cub[0]; x <= row.cub[1]; ++x) {
    for (let y = row.cub[2]; y <= row.cub[3]; ++y) {
      for (let z = row.cub[4]; z <= row.cub[5]; ++z) {
        map1.set([x, y, z], val);
      }
    }
  }
});
let ans1 = map1.values().filter((vv) => vv === 1).length;
answer(1, ans1);

let onz = [];
function between(xs, xe, ve) {
  return ve >= xs && ve <= xe;
}

function lsplit(x1, x2, x21, x22): number[][] {
  let pozitions = [x21, x22].filter((coord) => between(x1, x2, coord));
  pozitions = [x1, ...pozitions, x2];
  let result = [];
  for (let i = 1; i < pozitions.length; ++i) {
    result.push([pozitions[i - 1], pozitions[i]]);
  }
  return result;
}

function contains(cube1, cube2) {
  if (
    between(cube1[0], cube1[1], cube2[0]) &&
    between(cube1[0], cube1[1], cube2[1]) &&
    between(cube1[2], cube1[3], cube2[2]) &&
    between(cube1[2], cube1[3], cube2[3]) &&
    between(cube1[4], cube1[5], cube2[4]) &&
    between(cube1[4], cube1[5], cube2[5])
  ) {
    return true;
  }
  return false;
}

function intersects(cube1, cube2) {
  if (
    cube1[0] <= cube2[1] &&
    cube1[1] >= cube2[0] &&
    cube1[2] <= cube2[3] &&
    cube1[3] >= cube2[2] &&
    cube1[4] <= cube2[5] &&
    cube1[5] >= cube2[4]
  ) {
    return true;
  }
  return false;
}

function substract(cube1: number[], cube2: number[]) {
  if (contains(cube2, cube1)) return [];
  if (!intersects(cube1, cube2)) return [cube1];
  let xi = lsplit(cube1[0], cube1[1], cube2[0], cube2[1]);
  let yi = lsplit(cube1[2], cube1[3], cube2[2], cube2[3]);
  let zi = lsplit(cube1[4], cube1[5], cube2[4], cube2[5]);
  let result = [];
  dbg(xi);
  xi.forEach((xs) => {
    yi.forEach((ys) => {
      zi.forEach((zs) => {
        result.push(dbg([...xs, ...ys, ...zs]));
      });
    });
  });
  dbg(result);
  result = result.filter((rv) => !contains(cube2, rv));
  return result;
}

contents.forEach((row, ri) => {
  dbg(row);
  onz = onz.flatMap((cube) => {
    return substract(cube, row.cub);
  });
  if (row.op === "on") {
    onz.push(row.cub);
  }
  dbg(onz.length);
});

let volume = 0;
onz.forEach((cube) => {
  volume += (cube[1] - cube[0] + 1) * (cube[3] - cube[2] + 1) * (cube[5] - cube[4] + 1);
});

answer(2, volume);
