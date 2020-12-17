const fs = require("fs");
const HM = require("hashmap");
const md5 = require("js-md5");
const PQ = require("js-priority-queue");
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
let space = [];
contents.forEach((line, idx) => {
  line.split("").forEach((ch, idx1) => {
    _.set(space, [0, 0, idx, idx1], ch);
  });
});

let ssize = contents[0].length;
function vadd(p1, p2) {
  return _.zip(p1, p2).map(([a, b]) => a + b);
}

function neighs(space, pos) {
  let res = [];
  for (let i = -1; i <= 1; ++i) {
    for (let j = -1; j <= 1; ++j) {
      for (let k = -1; k <= 1; ++k) {
        for (let w = -1; w <= 1; ++w) {
          if (i === 0 && j === 0 && k === 0 && w === 0) {
            continue;
          }
          const cpos = vadd(pos, [i, j, k, w]);
          res.push(_.get(space, cpos, "."));
        }
      }
    }
  }
  return res;
}

function next(space) {
  const nspace = [];
  for (let i = -ssize; i <= ssize; ++i) {
    for (let j = -ssize; j <= ssize; ++j) {
      for (let k = -ssize; k <= ssize; ++k) {
        for (let w = -ssize; w <= ssize; ++w) {
          const mp = [i, j, k, w];
          let ne = neighs(space, mp).filter((ch) => ch === "#");
          if (_.get(space, mp, ".") === "#") {
            if (ne.length === 2 || ne.length === 3) {
              _.set(nspace, mp, "#");
            } else {
              _.set(nspace, mp, ".");
            }
          } else {
            if (ne.length === 3) {
              _.set(nspace, mp, "#");
            } else {
              _.set(nspace, mp, ".");
            }
          }
        }
      }
    }
  }
  ssize += 1;
  return nspace;
}

function dump(space, ssize, zl, zl1) {
  let l = space[zl];
  for (let i = -ssize; i <= ssize; ++i) {
    let sbuf = [];
    for (let j = -ssize; j <= ssize; ++j) {
      sbuf.push(_.get(space, [zl, zl1, i, j], "."));
    }
    console.log(sbuf.join(""));
  }
}

function ans1(space) {
  let ans = 0;
  for (let i = -ssize; i <= ssize; ++i) {
    for (let j = -ssize; j <= ssize; ++j) {
      for (let k = -ssize; k <= ssize; ++k) {
        for (let w = -ssize; w <= ssize; ++w) {
          ans += _.get(space, [i, j, k, w], ".") === "#" ? 1 : 0;
        }
      }
    }
  }
  return ans;
}

for (let i = 0; i < 6; ++i) {
  space = next(space);
  /*console.log(i + 1);
  console.log(ans1(space));*/
  // dump(space, ssize, 0, 0);
}
console.log("Answer 2", ans1(space));
