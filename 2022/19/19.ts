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

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .map((s) =>
    s
      .split(/[:.]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  );
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let blueprints = [];
const MATERIALS = ["ore", "clay", "obsidian", "geode"];
contents.forEach((line) => {
  let blueprint = {};
  blueprints.push(blueprint);
  line.forEach((ln) => {
    const words = ln.split(" ");
    if (words[0] === "Each") {
      let matlist = {};
      const type = words[1];
      const rest = words.slice(2);
      blueprint[type] = matlist;
      MATERIALS.forEach((mat) => {
        let matIndex = rest.indexOf(mat);
        if (matIndex > -1) {
          matlist[mat] = Number(rest[matIndex - 1]);
        } else {
          matlist[mat] = 0;
        }
      });
    }
  });
});

dbg(blueprints);
let ALLTIME = 24;
let maxGeode = 0;
DEBUG = true;
function dfs(blueprint, cutoff, robots, materials, time) {
  if (time >= ALLTIME) {
    //dbg([maxGeode, time, robots, materials]);
    maxGeode = Math.max(maxGeode, materials["geode"]);
    return;
  }
  MATERIALS.forEach((robot) => {
    if (robots[robot] > cutoff[robot]) {
      return;
    }
    let deltas = MATERIALS.map((mat) => blueprint[robot][mat] - materials[mat]);
    let prtime = MATERIALS.map((mat, idx) =>
      deltas[idx] > 0 ? Math.ceil(deltas[idx] / robots[mat]) : 0
    );
    //dbg([robot, prtime, robots]);
    let maxTime = Math.max(...prtime);
    if (!isFinite(maxTime)) {
      return;
    }
    if (time + maxTime + 1 > ALLTIME) {
      let remtime = ALLTIME - time;
      let newMaterials = {};
      MATERIALS.forEach((mat) => {
        newMaterials[mat] = materials[mat] + remtime * robots[mat];
      });
      dfs(blueprint, cutoff, robots, newMaterials, ALLTIME);
      return;
    }
    let newMaterials = {};
    MATERIALS.forEach((mat) => {
      newMaterials[mat] =
        materials[mat] + (1 + maxTime) * robots[mat] - blueprint[robot][mat];
    });
    let newRobots = { ...robots };
    newRobots[robot]++;
    dfs(blueprint, cutoff, newRobots, newMaterials, time + maxTime + 1);
  });
}

let ans1 = 0;
blueprints.forEach((currentBP, index) => {
  maxGeode = 0;
  let ID = index + 1;
  let robots = {};
  let materials = {};
  let cutoff = {};

  MATERIALS.forEach((mat) => {
    robots[mat] = 0;
    materials[mat] = 0;
    cutoff[mat] = 0;
  });
  robots["ore"] = 1;
  MATERIALS.forEach((mat) => {
    let matslice = MATERIALS.map((robot) => currentBP[robot][mat]);
    let max = Math.max(...matslice);
    cutoff[mat] = max;
  });
  cutoff["geode"] = Infinity;

  dfs(currentBP, cutoff, robots, materials, 0);
  dbg([ID, maxGeode]);
  let quality = ID * maxGeode;
  ans1 += quality;
});
answer(1, ans1);

ALLTIME = 32;
let s2 = [];
blueprints.slice(0, 3).forEach((currentBP, index) => {
  maxGeode = 0;
  let ID = index + 1;
  let robots = {};
  let materials = {};
  let cutoff = {};

  MATERIALS.forEach((mat) => {
    robots[mat] = 0;
    materials[mat] = 0;
    cutoff[mat] = 0;
  });
  robots["ore"] = 1;
  MATERIALS.forEach((mat) => {
    let matslice = MATERIALS.map((robot) => currentBP[robot][mat]);
    let max = Math.max(...matslice);
    cutoff[mat] = max;
  });
  cutoff["geode"] = Infinity;

  dfs(currentBP, cutoff, robots, materials, 0);
  dbg([ID, maxGeode]);
  s2.push(maxGeode);
});
let ans2 = s2[0] * s2[1] * s2[2];
answer(2, ans2);
