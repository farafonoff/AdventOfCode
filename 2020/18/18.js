const fs = require("fs");
const HM = require("hashmap");
const md5 = require("js-md5");
const PQ = require("js-priority-queue");
const { isNumber, isArray } = require("lodash");
const _ = require("lodash");
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
  .filter((s) => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
function trnum(val) {
  let nn = Number(val);
  if (isFinite(nn)) {
    return nn;
  }
  return val;
}
function tok(str) {
  let tokens = [];
  let toky = "";
  str.split("").forEach((ch) => {
    switch (ch) {
      case " ": {
        tokens.push(toky);
        toky = "";
        break;
      }
      case "(":
      case ")":
      case "+":
      case "*": {
        tokens.push(toky);
        tokens.push(ch);
        toky = "";
        break;
      }
      default: {
        toky += ch;
      }
    }
  });
  tokens.push(toky);
  return tokens.filter((ss) => ss.length > 0).map(trnum);
}

function _tonod(toks, pos) {
  let nod;
  //console.log("NOD", toks[pos]);
  if (isNumber(toks[pos])) {
    nod = toks[pos];
    pos += 1;
  } else {
    rec = _synt(toks, pos + 1);
    pos = rec.pos + 1;
    nod = rec.nod;
  }
  return {
    pos,
    nod,
  };
}
function _synt(toks, start) {
  let pos = start;
  let eq = [];
  while (toks[pos] !== ")" && toks[pos] !== undefined) {
    //console.log(toks[pos]);
    if (["+", "*"].indexOf(toks[pos]) !== -1) {
      eq.push(toks[pos]);
      ++pos;
    } else {
      let rec = _tonod(toks, pos);
      pos = rec.pos;
      eq.push(rec.nod);
    }
  }
  //console.log(eq);
  return { nod: eq, pos: pos };
}
/*
function _synt(toks, start) {
  let left, right;
  let pos;
  //console.log("SYN", toks[start]);
  if (start === toks.length) {
    return {};
  }
  let rec = _synt(toks, start);
  left = rec.nod;
  pos = rec.pos;
  let op = toks[pos];
  if (op === ")" || op === undefined) {
    return {
      nod: left,
      pos: pos + 1,
    };
  }
  ++pos;
  rec = _tonod(toks, pos);
  right = rec.nod;
  pos = rec.pos;
  return {
    nod: {
      left,
      right,
      op,
    },
    pos,
  };
}
*/

let recalc;

function rec1(arr) {
  let val = 0;
  let lop = "";
  arr.forEach((tok) => {
    if (tok === "+" || tok === "*") {
      lop = tok;
    } else {
      if (lop.length > 0) {
        switch (lop) {
          case "*":
            val *= recalc(tok);
            break;
          case "+":
            val += recalc(tok);
            break;
        }
      } else {
        val = recalc(tok);
      }
    }
  });
  return val;
}

function rec2(arr) {
  ["+", "*"].forEach((op) => {
    let tmp = [];
    for (let idx = 0; idx < arr.length; ++idx) {
      let v = arr[idx];
      if (v === op) {
        let lv = tmp[tmp.length - 1];
        switch (op) {
          case "*":
            tmp[tmp.length - 1] = recalc(lv) * recalc(arr[idx + 1]);
            break;
          case "+":
            tmp[tmp.length - 1] = recalc(lv) + recalc(arr[idx + 1]);
            break;
        }
        idx += 1;
      } else {
        tmp.push(arr[idx]);
      }
    }
    arr = tmp;
  });
  return arr[0];
}

const recalcBuilder = (compf) => (tree) => {
  if (!tree) {
    return 0;
  }
  if (isNumber(tree)) {
    return tree;
  }
  if (tree.nod) {
    return recalc(tree.nod);
  }
  if (isArray(tree)) {
    //return rec1(tree);
    return compf(tree);
  }
};

function _calc(toks) {
  let tree = _synt(toks, 0);
  // console.log(JSON.stringify(tree, null, 2));
  return recalc(tree);
}

function calc(str) {
  let toks = tok(str);
  return _calc(toks, 0);
}

let acc = 0;
recalc = recalcBuilder(rec1);
contents.forEach((line) => {
  let toks = tok(line);
  let tree = _synt(toks, 0);
  let res = recalc(tree);
  acc += res;
});
console.log(acc);

acc = 0;
recalc = recalcBuilder(rec2);
contents.forEach((line) => {
  let toks = tok(line);
  let tree = _synt(toks, 0);
  let res = recalc(tree);
  acc += res;
});
console.log(acc);
