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
  .filter((s) => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let mapData = new HM<[number, number], number>();
contents.forEach((line, ridx) => {
  line.split("").forEach((ch, cidx) => {
    if (ch === "#") {
      mapData.set([ridx, cidx], 1);
    }
  });
});

function vadd(v1, v2) {
  return v1.map((vc, vn) => vc + v2[vn]);
}

function nextOf(pos, prop) {
  let next = pos;
  switch (prop) {
    case "N": {
      next = vadd(pos, [-1, 0]);
      break;
    }
    case "S": {
      next = vadd(pos, [1, 0]);
      break;
    }
    case "W": {
      next = vadd(pos, [0, -1]);
      break;
    }
    case "E": {
      next = vadd(pos, [0, 1]);
      break;
    }
  }
  return next;
}
let moved = false;
let dirOrder = ["N", "S", "W", "E"];
function step(mapData) {
  let proposals = new HM<[number, number], any>();
  let moves = new HM<[number, number], any>();
  let nextMap = new HM<[number, number], number>();
  moved = false;
  mapData.entries().forEach((entry) => {
    let pos = entry[0];
    let neighbors = 0;
    let nbMap = {
      N: 0,
      S: 0,
      W: 0,
      E: 0,
    };
    for (let i = -1; i <= 1; ++i) {
      for (let j = -1; j <= 1; ++j) {
        if (i !== 0 || j !== 0) {
          let apos = vadd(pos, [i, j]);
          if (mapData.has(apos)) {
            ++neighbors;
            if (i === -1) {
              nbMap.N++;
            }
            if (i === 1) {
              nbMap.S++;
            }
            if (j === -1) {
              nbMap.W++;
            }
            if (j === 1) {
              nbMap.E++;
            }
          }
        }
      }
    }
    let shouldMove = false;
    if (neighbors > 0) {
      let prop;
      for (let i = 0; i < dirOrder.length; ++i) {
        if (nbMap[dirOrder[i]] === 0 && !prop) {
          prop = dirOrder[i];
          break;
        }
      }
      if (prop) {
        shouldMove = true;
        let next = nextOf(pos, prop);
        //dbg([pos, prop, next]);
        moves.set(pos, next);
        if (proposals.has(next)) {
          let ov = proposals.get(next);
          proposals.set(next, ov + 1);
        } else {
          proposals.set(next, 1);
        }
      }
    }
    if (!shouldMove) {
      nextMap.set(pos, 1);
    }
  });
  moves.entries().forEach(([pos, next]) => {
    let count = proposals.get(next);
    if (count === 1) {
      nextMap.set(next, 1);
      moved = true;
    } else {
      nextMap.set(pos, 1);
    }
  });
  let fd = dirOrder.shift();
  dirOrder.push(fd);
  return nextMap;
}

function bbox(map) {
  let [mar, mir, mac, mic] = [-Infinity, Infinity, -Infinity, Infinity];
  map.entries().forEach(([pos]) => {
    mar = Math.max(pos[0], mar);
    mac = Math.max(pos[1], mac);
    mir = Math.min(pos[0], mir);
    mic = Math.min(pos[1], mic);
  });
  return [mar, mir, mac, mic];
}

function dbgMap(map, [mar, mir, mac, mic]: number[]) {
  for (let i = mir; i <= mar; ++i) {
    let srow = [];
    for (let j = mic; j <= mac; ++j) {
      if (map.has([i, j])) {
        srow.push("#");
      } else {
        srow.push(".");
      }
    }
    dbg(srow.join(""));
  }
}

let tmap = mapData;
for (let i = 0; i < 10000; ++i) {
  tmap = step(tmap);
  let bbx = bbox(tmap);
  if (i === 9) {
    let area = (bbx[0] - bbx[1] + 1) * (bbx[2] - bbx[3] + 1);
    answer(1, area - tmap.count());
  }
  if (!moved) {
    answer(2, i + 1);
    break;
  }
}
