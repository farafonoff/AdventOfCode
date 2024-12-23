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
let buyers = [];
contents.forEach((line) => {
  buyers.push(Number(line))
});


function next(secret: number) {
  let r1 = secret * 64;
  secret = secret ^ r1 % 16777216;
  let r2 = secret >> 5;
  secret = secret ^ r2 % 16777216;
  let r3 = secret * 2048;
  secret = secret ^ r3 % 16777216;
  return secret;
}
/*
let t1 = 123;
for(let i=0;i<10;++i) {
  t1 = next(t1)
  dbg(t1)
}
*/
let buyerdata: {
  prices: number[],
  changes: number[],
}[] = []
let ans1 = buyers.map(bn => {
  let changes = [null];
  let prices = [bn%10];
  let oldprice = bn;
  for(let i=0;i<2000;++i) {
    bn = next(bn);
    prices.push(bn%10)
    changes.push(bn%10-oldprice%10)
    oldprice = bn;
  }
  buyerdata.push(
    {prices, changes}
  )
  return bn;
}).reduce((a,b) => a+b, 0)
answer(1, ans1)
//console.log(JSON.stringify(buyerdata))
let allwindows = new HM<number[], number>();
let tables = buyerdata.map(buyer => {
  let priceTable = new HM<number[], number>();
  for(let i=4;i<buyer.prices.length;++i) {
    let window = buyer.changes.slice(i-3, i+1);
    if (!priceTable.has(window)) {
      priceTable.set(window, buyer.prices[i])
      let ov = 0;
      if (allwindows.has(window)) {
        ov = allwindows.get(window)
      }
      allwindows.set(window, ov + buyer.prices[i])
    }
    //console.log(window);
  }
})

//allwindows.entries().forEach(entry => console.log(entry))
//let ans2 = Math.max(...allwindows.values())
let maxKey, maxValue = -1;
allwindows.entries().forEach(([k, v]) => {
  if (v > maxValue)  {
    maxValue = v;
    maxKey = k;
  }
})
answer(2, maxValue)
console.log(maxKey)
