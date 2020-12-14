const fs = require("fs");
const HM = require("hashmap");
const md5 = require("js-md5");
const PQ = require("js-priority-queue");
const _ = require("lodash");
const bigInt = require("big-integer");
const infile = process.argv[2] || "input";
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

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .map((s) => s.split(" = "));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
const state = {};
let maskstr = "";
contents.forEach((line) => {
  const [op, val] = line;
  switch (op) {
    case "mask": {
      maskstr = val.split("");
      break;
    }
    default: {
      const bval = bigInt(val, 10);
      const sval = bval.toString(2);

      const padded = sval.padStart(36, "0").split("");
      const res = _.zip(maskstr, padded)
        .map((ar) => {
          if (ar[0] === "X") return ar[1];
          return ar[0];
        })
        .join("");
      state[op] = res;
    }
  }
});
let sum = bigInt(0);
Object.keys(state).forEach((key) => {
  sum = sum.plus(bigInt(state[key], 2));
});
console.log(sum.toString());

let state2 = {};

function deepset(addr, val, fbit = 0) {
  if (fbit === addr.length) {
    state2[addr.join()] = val;
    return;
  }
  if (addr[fbit] === "X") {
    let acopy = [...addr];
    acopy[fbit] = "0";
    deepset(acopy, val, fbit + 1);
    acopy[fbit] = "1";
    deepset(acopy, val, fbit + 1);
  } else {
    deepset(addr, val, fbit + 1);
  }
}

contents.forEach((line) => {
  let [op, val] = line;
  switch (op) {
    case "mask": {
      maskstr = val.split("");
      break;
    }
    default: {
      op = op.substr(4, op.length - 5);
      let opval = bigInt(op, 10).toString(2).padStart(36, "0").split("");
      let fixed = _.zip(maskstr, opval).map((ar) => {
        if (ar[0] === "0") return ar[1];
        return ar[0];
      });
      deepset(fixed, val);
    }
  }
});
sum = bigInt(0);
Object.keys(state2).forEach((key) => {
  sum = sum.plus(bigInt(state2[key], 10));
});
console.log(sum.toString());