import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _, { result } from "lodash";
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

let target = `
#############
#...........#
###A#B#C#D###
  #A#B#C#D#
  #########`;

var targets = target
  .split("\n")
  //.map((s) => s.trim())
  .filter((s) => s.length > 0)
  .map((s) => s.split(""));
var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  //.map((s) => s.trim())
  .filter((s) => s.length > 0)
  .map((s) => s.split(""));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
//dbg(contents);
class State {
  position: string[][];
  energy: number;
  pe?: number;
}
let LETTERS = ["A", "B", "C", "D"];
let roomIndices = targets[targets.length - 2]
  .map((vv, idx) => [vv, idx])
  .filter(([vv, idx]) => LETTERS.includes(vv as string))
  .map(([vv, idx]) => idx);
let DEST = {};
_.zip(LETTERS, roomIndices).forEach(([lett, idx]) => (DEST[lett] = idx));
let HALLWAY = 1;
let ROOM = [2, 3];
let ENERGY_ = [1, 10, 100, 1000];
let ENERGY = {};
_.zip(LETTERS, ENERGY_).forEach(([lett, eng]) => (ENERGY[lett] = eng));
function canPlace(state: State, cpos: number[]) {
  //dbg("CAN PLACE");
  let amp = _.get(state.position, cpos, ".");
  let dest = DEST[amp];
  let energy = ENERGY[amp];
  let pl1 = state.position[ROOM[0]][dest] === ".";
  let pl2 = state.position[ROOM[1]][dest];
  let drow = -1;
  if (pl2 === ".") {
    drow = ROOM[1];
  } else if (pl2 === amp && pl1) {
    drow = ROOM[0];
  }
  if (drow === -1) return -1;
  let pathFree = true;
  let diff = Math.sign(cpos[1] - dest);
  //dbg([dest, cpos[1], diff]);
  for (let i = dest; i != cpos[1]; i += diff) {
    if (_.get(state.position, [HALLWAY, i]) !== ".") {
      pathFree = false;
    }
  }
  if (!pathFree) {
    return -1;
  }
  let moveDown = drow === ROOM[1];
  let pathEnergy = Math.abs(dest - cpos[1]) + (moveDown ? 2 : 1);
  return pathEnergy * energy;
}
function putInPlace(state: State, cpos: number[]) {
  let amp = _.get(state.position, cpos, ".");
  let dest = DEST[amp];
  let energy = ENERGY[amp];
  let placement = state.position[ROOM[0]][dest] === ".";
  let moveDown = state.position[ROOM[1]][dest] === ".";
  _.set(state.position, cpos, ".");
  if (moveDown) {
    _.set(state.position, [ROOM[1], dest], amp);
  } else {
    _.set(state.position, [ROOM[0], dest], amp);
  }
}
function putInHallway(state: State, cpos: number[], target: number) {
  let amp = _.get(state.position, cpos, ".");
  _.set(state.position, cpos, ".");
  _.set(state.position, [HALLWAY, target], amp);
}
function moveAway(state: State, cpos: number[]) {
  let amp = _.get(state.position, cpos, ".");
  let dest = DEST[amp];
  //dbg([amp, dest, cpos[1]], "MOVE AWAY");
  let finish =
    cpos[1] === dest &&
    (cpos[0] === ROOM[1] || _.get(state.position, [ROOM[1], dest]) === amp);
  if (finish) return [];
  if (cpos[0] === ROOM[1] && _.get(state.position, [ROOM[0], cpos[1]]) !== ".")
    return [];
  let energy = ENERGY[amp];
  let baseEnergy = cpos[0] === ROOM[1] ? energy * 2 : energy;
  let result = [];
  function tryMove(range: number) {
    let hpos = cpos[1] + range;
    let ch = _.get(state.position, [HALLWAY, hpos]);
    if (ch !== ".") return false;
    if (!roomIndices.includes(hpos)) {
      let newState = _.cloneDeep(state);
      putInHallway(newState, cpos, hpos);
      newState.energy += baseEnergy + Math.abs(range * energy);
      result.push(newState);
    }
    return true;
  }
  for (let range = 0; range < 50; ++range) {
    let con = tryMove(range);
    if (!con) break;
  }
  for (let range = 0; range >= -50; --range) {
    let con = tryMove(range);
    if (!con) break;
  }
  return result;
}
function pe(pos: State) {
  let pe = 0;
  pos.position.forEach((prow, pidx) => {
    if (pidx === HALLWAY) {
      prow.forEach((pcell, cidx) => {
        if (LETTERS.includes(pcell)) {
          let dest = DEST[pcell];
          let energy = ENERGY[pcell];
          pe += (Math.abs(dest - cidx) + 1) * energy;
        }
      });
    } else {
      prow.forEach((pcell, cidx) => {
        if (LETTERS.includes(pcell)) {
          let dest = DEST[pcell];
          let energy = ENERGY[pcell];
          if (dest !== cidx) {
            pe += (Math.abs(dest - cidx) + 2) * energy;
          }
        }
      });
    }
  });
  return pe;
}
function expandPosition(pos: State): State[] {
  let result: State[] = [];
  //dbg("===============");
  //dbg(pps(pos));
  pos.position.forEach((prow, pidx) => {
    if (pidx === HALLWAY) {
      prow.forEach((pcell, cidx) => {
        if (LETTERS.includes(pcell)) {
          let placeEnergy = canPlace(pos, [pidx, cidx]);
          if (placeEnergy != -1) {
            //dbg("PUT IN PLACE");
            //dbg(pps(pos));
            let newState = _.cloneDeep(pos);
            putInPlace(newState, [pidx, cidx]);
            newState.energy += placeEnergy;
            //dbg(pps(newState));
            //dbg("PUT IN PLACE DONE");
            result.push(newState);
          }
        }
      });
    } else {
      prow.forEach((pcell, cidx) => {
        if (LETTERS.includes(pcell)) {
          let states = moveAway(pos, [pidx, cidx]);
          result.push(...states);
        }
      });
    }
  });
  result.forEach((rv) => {
    rv.pe = pe(rv);
  });
  /*result.forEach((rr) => {
    dbg(pps(rr));
  });
  dbg("===============");*/
  return result;
}

function equals(st1: string[][], st2: string[][]) {
  let sv1 = st1.map((sr) => sr.join("").trim()).join("");
  let sv2 = st2.map((sr) => sr.join("").trim()).join("");
  return sv1 === sv2;
}

function bfs() {
  let open = new PQ<State>({
    comparator: (st1, st2) => st1.energy + st1.pe - (st2.energy + st2.pe),
  });
  let closed = new HM<string[][], number>();
  let initial: State = { position: contents, energy: 0 };
  initial.pe = pe(initial);
  open.queue(initial);
  while (open.length > 0) {
    let spos = open.dequeue();
    if (closed.has(spos.position)) {
      let oev = closed.get(spos.position);
      if (oev < spos.energy) {
        continue;
      }
    }
    //dbg(spos);
    if (equals(spos.position, targets)) {
      dbg(spos);
      return;
    }
    closed.set(spos.position, spos.energy);
    //dbg(pps(spos));
    dbg(spos.energy);
    //dbg(open.length);
    let exp = expandPosition(spos);
    exp.forEach((sp) => open.queue(sp));
  }
  dbg("OUT");
}

function prettyPrint(dd: string[][]) {
  return dd.map((pr) => pr.join("")).join("\n");
}

function pps(state: State) {
  return prettyPrint(state.position);
}

dbg(prettyPrint(contents));
//dbg(prettyPrint(targets));
bfs();
