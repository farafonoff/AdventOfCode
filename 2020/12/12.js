const fs = require("fs");
const HM = require("hashmap");
const md5 = require("js-md5");
const PQ = require("js-priority-queue");
const _ = require("lodash");
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

const infile = process.argv[2] || "input";
var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .map((s) => ({
    action: s.slice(0, 1),
    value: Number(s.slice(1)) % 360,
  }));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
const initial = [0, 0, 1, 0];
const moves = {
  N: [0, 1],
  S: [0, -1],
  E: [1, 0],
  W: [-1, 0],
};

const icos = {
  0: 1,
  90: 0,
  180: -1,
  270: 0,
  360: 1,
};
const isin = {
  0: 0,
  90: 1,
  180: 0,
  270: -1,
  360: 0,
};

function next(pos, cmd) {
  let npos = [...pos];
  switch (cmd.action) {
    case "R": {
      npos[2] = pos[2] * icos[cmd.value] + pos[3] * isin[cmd.value];
      npos[3] = -pos[2] * isin[cmd.value] + pos[3] * icos[cmd.value];
      break;
    }
    case "L": {
      npos[2] = pos[2] * icos[cmd.value] - pos[3] * isin[cmd.value];
      npos[3] = pos[2] * isin[cmd.value] + pos[3] * icos[cmd.value];
      break;
    }
    case "F": {
      npos[0] += npos[2] * cmd.value;
      npos[1] += npos[3] * cmd.value;
      break;
    }
    default: {
      npos[0] += moves[cmd.action][0]*cmd.value;
      npos[1] += moves[cmd.action][1]*cmd.value;
      break;
    }
  }
  return npos;
}

let current = [...initial]
contents.forEach(act => {
    current = next(current, act)
    //console.log(act, current)
})
console.log(Math.abs(current[0]) + Math.abs(current[1]))

const initial2 = [
    0, 0, 10, 1
]
function next2(pos, cmd) {
  let npos = [...pos];
  switch (cmd.action) {
    case "R": {
      npos[2] = pos[2] * icos[cmd.value] + pos[3] * isin[cmd.value];
      npos[3] = -pos[2] * isin[cmd.value] + pos[3] * icos[cmd.value];
      break;
    }
    case "L": {
      npos[2] = pos[2] * icos[cmd.value] - pos[3] * isin[cmd.value];
      npos[3] = pos[2] * isin[cmd.value] + pos[3] * icos[cmd.value];
      break;
    }
    case "F": {
      npos[0] += npos[2] * cmd.value;
      npos[1] += npos[3] * cmd.value;
      break;
    }
    default: {
      npos[2] += moves[cmd.action][0] * cmd.value;
      npos[3] += moves[cmd.action][1] * cmd.value;
      break;
    }
  }
  return npos;
}

current = [...initial2];
contents.forEach((act) => {
  current = next2(current, act);
  // console.log(act, current)
});
console.log(Math.abs(current[0]) + Math.abs(current[1]));