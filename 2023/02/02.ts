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
const games = [];
contents.forEach((line) => {
  const [header, body] = line.split(': ')
  const [_, gameId] = header.split(' ')
  const gamesList = body.split('; ').map(game => game.split(', ').map(gc => gc.split(' ').map(trnum)));
  games.push([gameId, gamesList]);
});

let p1 = {
  'red': 12,
  'green': 13,
  'blue': 14
}
let matching = games.filter(([gameId, gameList]) => {
  let possible = true;
  gameList.forEach(game => {
    game.forEach(([count, color]) => {
      if (count > p1[color]) {
        possible = false;
      }
    });
  })
  return possible
});

let ans1 = 0;
matching.forEach(([id, gl]) => ans1 += Number(id))
answer(1, ans1)

let powers = games.map(([gameId, gameList]) => {
  let pw = {
    'red': 0,
    'green': 0,
    'blue': 0
  }
  gameList.forEach(game => {
    game.forEach(([count, color]) => {
      pw[color] = Math.max(count, pw[color])
    });
  })
  return pw.red * pw.green * pw.blue
})
let ans2 = powers.reduce((a,b) => a+b)
answer(2, ans2)