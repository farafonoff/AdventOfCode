import * as fs from "fs";
import HM from "hashmap";
import md5, { update } from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
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

/*var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);*/
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .map((s) => s.match(/Player (\d) starting position: (\d)/))
  .map((s) => s.slice(1).map(Number).concat([0])); // [orig, g1, g2 ...] = content
let cbak = _.cloneDeep(contents);
let cube = 0;
let rolls = 0;
DEBUG = false;
function roll3d100() {
  let v1 = cube;
  let v2 = (cube + 1) % 100;
  let v3 = (cube + 2) % 100;
  cube = (cube + 3) % 100;
  rolls += 3;
  let res = v1 + v2 + v3 + 3;
  dbg([v1, v2, v3, res]);
  return res;
}
dbg(contents);
for (let step = 0; step < 1000; ++step) {
  let offs = roll3d100();
  contents[0][1] += offs;
  contents[0][1] = ((contents[0][1] - 1) % 10) + 1;
  contents[0][2] += contents[0][1];
  if (contents[0][2] >= 1000) {
    break;
  }
  let offs1 = roll3d100();
  contents[1][1] += offs1;
  contents[1][1] = ((contents[1][1] - 1) % 10) + 1;
  contents[1][2] += contents[1][1];
  if (contents[1][2] >= 1000) {
    break;
  }
  dbg([offs, offs1]);
  dbg(contents);
}
answer(1, Math.min(contents[0][2], contents[1][2]) * rolls);

DEBUG = false;
contents = cbak;

let cubes = [1, 2, 3];
let densiti = [];
function roll3d(idx, sum) {
  if (idx > 1) {
    _.set(densiti, [sum], _.get(densiti, [sum], 0) + 1);
    return;
  }
  cubes.forEach((cub) => {
    roll3d(idx + 1, sum + cub);
  });
}
roll3d(-1, 0);
let gameStates = new HM<number[], number>();
gameStates.set([contents[0][1], contents[1][1], 0, 0], 1);
function updateStates(pozs: HM<number[], number>, pl) {
  let result = new HM<number[], number>();
  pozs.entries().forEach(([state, densi]) => {
    densiti.forEach((dv, di) => {
      let nstate = [...state];
      let val = densi * dv;
      nstate[0 + pl] = ((nstate[0 + pl] + di - 1) % 10) + 1;
      nstate[2 + pl] += nstate[0 + pl];
      let oval = result.get(nstate) || 0;
      result.set(nstate, val + oval);
    });
  });
  return result;
}
let wins1 = 0;
let wins2 = 0;
function accWins() {
  gameStates.entries().forEach(([estate, edens]) => {
    if (estate[2] >= 21) {
      wins1 += edens;
      gameStates.delete(estate);
    }
    if (estate[3] >= 21) {
      wins2 += edens;
      gameStates.delete(estate);
    }
  });
}
for (let step = 0; step < 50; ++step) {
  gameStates = updateStates(gameStates, 0);
  accWins();
  gameStates = updateStates(gameStates, 1);
  accWins();
}
dbg([wins1, wins2]);
answer(2, Math.max(wins1, wins2));
/*
let position = new HM<number[], number>();
let scores = new HM<number[], number>();
position.set([contents[0][1], contents[1][1]], 1);
scores.set([0, 0], 1);
function updatePositions(pozs: HM<number[], number>, pl) {
  let result = new HM<number[], number>();
  for (let pozz = 1; pozz <= 10; ++pozz) {
    densiti.forEach((dv, di) => {
      let upozz = ((pozz + di - 1) % 10) + 1;
      for (let opozz = 1; opozz < 10; ++opozz) {
        let coord = pl == 0 ? [pozz, opozz] : [opozz, pozz];
        let ncoord = pl == 0 ? [upozz, opozz] : [opozz, upozz];
        let ovalue = pozs.get(coord) || 0;
        let nvalue = (result.get(ncoord) || 0) + ovalue * dv;
        result.set(ncoord, nvalue);
      }
    });
  }
  return result;
}

function updateScores(
  scores: HM<number[], number>,
  poss: HM<number[], number>,
  pl
) {
  let result = new HM<number[], number>();
  scores.entries().forEach((co, sdens) => {
    poss.entries().forEach((pos, dens) => {
      let ncoord = _.zip(co, pos).map((v) => _.sum(v));
      result.set(ncoord, sdens * dens);
    });
  });
  return result;
}

for (let step = 0; step < 1; ++step) {
  position = updatePositions(position, 0);
  dbg(position);
  position = updatePositions(position, 1);
  dbg(position);
  //dbg(pl1s);
  //dbg(pl2sc, "scores2");
}
*/
//dbg(densiti);
/*let pl1s = new HM<number, number>();
let pl2s = new HM<number, number>();
let pl1sc = new HM<number, number>();
let pl2sc = new HM<number, number>();
pl1sc.set(0, 1);
pl2sc.set(0, 1);
pl1s.set(contents[0][1], 1);
pl2s.set(contents[1][1], 1);
function update(pltab: HM<number, number>, plscr: HM<number, number>) {
  let restab = new HM<number, number>();
  let scrtab = new HM<number, number>();
  pltab.entries().forEach(([p1, pv]) => {
    densiti.forEach((cv, ci) => {
      let cc = ((p1 + ci - 1) % 10) + 1;
      // dbg([p1, ci, cc, pv * cv]);
      let ov = restab.get(cc) || 0;
      restab.set(cc, pv * cv + ov);
      //dbg([cv, ci]);
    });
  });
  restab.entries().forEach(([ri, rv]) => {
    plscr.entries().forEach(([si, sv]) => {
      scrtab.set(ri + si, sv * rv);
    });
  });
  return [restab, scrtab];
}
//dbg(pl1s);
dbg(pl2s);
let wins1 = 0;
let wins2 = 0;
function updateWins(scrs: HM<number, number>) {
  let rwins = 0;
  scrs.entries().forEach(([scr, sd]) => {
    if (scr >= 21) {
      rwins += sd;
      scrs.delete(scr);
    }
  });
  return rwins;
}
for (let step = 0; step < 8; ++step) {
  [pl1s, pl1sc] = update(pl1s, pl1sc);
  wins1 += updateWins(pl1sc);
  [pl2s, pl2sc] = update(pl2s, pl2sc);
  wins2 += updateWins(pl2sc);
  //dbg(pl1s);
  //dbg(pl2sc, "scores2");
}
dbg([wins1, wins2]);
*/
