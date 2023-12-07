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

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
const hands = []
contents.forEach((line) => {
  if (line) {
    const [hand, bid] = line.split(' ')
    hands.push([handKindPower(hand) * 1000000 + handToNumber(hand), bid])
  }
});

hands.sort((a,b) => a[0] - b[0])
let ans1 = 0;
hands.forEach(([hand, bid], idx) => {
  ans1 += bid * (idx+1)
})
answer(1, ans1)

function handToNumber(hand) {
  const mm = {
    'T': 'A',
    'J': 'B',
    'Q': 'C',
    'K': 'D',
    'A': 'E'
  }
  const cards = hand.split('').map(c => {
    if (isFinite(Number(c))) {
      return c;
    } else {
      return mm[c];
    }
  }).join('')
  return Number.parseInt(cards, 16);
}

function handToNumber2(hand) {
  const mm = {
    'T': 'A',
    'J': '0',
    'Q': 'C',
    'K': 'D',
    'A': 'E'
  }
  const cards = hand.split('').map(c => {
    if (isFinite(Number(c))) {
      return c;
    } else {
      return mm[c];
    }
  }).join('')
  return Number.parseInt(cards, 16);
}

function handKindPower(hand) {
  const cards = hand.split('')
  const cardHash = {}
  cards.forEach(c => cardHash[c] = (cardHash[c] || 0) + 1)
  const cardArray = Object.entries(cardHash)
  cardArray.sort((a: any,b: any) => b[1] - a[1])
  if (cardArray[0][1] === 5) return 1000;
  if (cardArray[0][1] === 4) return 900;
  if (cardArray[0][1] === 3 && cardArray[1][1] === 2) return 800;
  if (cardArray[0][1] === 3 && cardArray[1][1] === 1) return 700;
  if (cardArray[0][1] === 2 && cardArray[1][1] === 2) return 600;
  if (cardArray[0][1] === 2 && cardArray[1][1] === 1) return 500;
  if (cardArray[0][1] === 1) return 400;
}


function handKindPower2(hand) {
  const cards = hand.split('')
  const cardHash = {}
  cards.forEach(c => cardHash[c] = (cardHash[c] || 0) + 1)
  const cardArray = Object.entries(cardHash)
  cardArray.sort((a: any,b: any) => b[1] - a[1])
  const JI = cardArray.findIndex(ca => ca[0] === 'J')
  dbg(JI)
  if (JI !== -1 && cardArray[JI][1] !== 5) {
    dbg(cardArray)
    const jj: any = cardArray[JI]
    cardArray.splice(JI, 1)
    cardArray[0][1] += jj[1];
  }
  dbg(cardArray)
  if (cardArray[0][1] === 5) return 1000;
  if (cardArray[0][1] === 4) return 900;
  if (cardArray[0][1] === 3 && cardArray[1][1] === 2) return 800;
  if (cardArray[0][1] === 3 && cardArray[1][1] === 1) return 700;
  if (cardArray[0][1] === 2 && cardArray[1][1] === 2) return 600;
  if (cardArray[0][1] === 2 && cardArray[1][1] === 1) return 500;
  if (cardArray[0][1] === 1) return 400;
}

const hands2 = []
contents.forEach((line) => {
  if (line) {
    const [hand, bid] = line.split(' ')
    hands2.push([handKindPower2(hand) * 1000000 + handToNumber2(hand), bid])
  }
});

hands2.sort((a,b) => a[0] - b[0])
let ans2 = 0;
hands2.forEach(([hand, bid], idx) => {
  ans2 += bid * (idx+1)
})
answer(2, ans2)