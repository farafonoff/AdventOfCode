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
    _.set(space, [0, idx, idx1], ch);
  });
});

let ssize = contents[0].length;
function vadd(p1, p2) {
  return _.zip(p1, p2).map(([a, b]) => a + b);
}

function dimens(dsize, dims, functor) {
  const arry = [];
  for (let i = -dsize; i <= dsize; ++i) {
    arry.push(i);
  }
  let state = [functor];
  for (let i = 0; i < dims; ++i) {
    state = state.map((f) => arry.map(f)).flat();
  }
  if (dims === 3) state = state.map((f) => f(0)).flat();
  return state;
}

function neighs(space, pos, ds) {
  let res = [];
  dimens(1, ds, (i) => (j) => (k) => (w) => {
    if (_.isEqual([i, j, k, w], [0, 0, 0, 0])) {
      return;
    }
    const cpos = vadd(pos, [i, j, k, w]);
    res.push(_.get(space, cpos, "."));
  });
  return res;
}

function next(space, ds) {
  const nspace = [];
  dimens(ssize, ds, (i) => (j) => (k) => (w) => {
    const mp = [i, j, k, w];
    let ne = neighs(space, mp, ds).filter((ch) => ch === "#");
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
  });
  ssize += 1;
  return nspace;
}

function dump(space, ssize, zl, zl1) {
  let l = space[zl];
  for (let i = -ssize; i <= ssize; ++i) {
    let sbuf = [];
    for (let j = -ssize; j <= ssize; ++j) {
      sbuf.push(_.get(space, [zl, i, j], "."));
    }
    console.log(sbuf.join(""));
  }
}

function ans1(space, ds) {
  let ans = 0;
  dimens(ssize, ds, (i) => (j) => (k) => (w) => {
    ans += _.get(space, [i, j, k, w], ".") === "#" ? 1 : 0;
  });
  return ans;
}

const ispace = _.cloneDeep(space);

for (let i = 0; i < 6; ++i) {
  space = next(space, 3);
  console.log(i + 1);
  console.log(ans1(space, 3));
  dump(space, ssize, 0);
}
console.log("Answer 1", ans1(space, 3));
/* part 2 is super slow, see 17_2
space = _.cloneDeep(ispace);
for (let i = 0; i < 6; ++i) {
  space = next(space, 4);
  console.log(i + 1);
  console.log(ans1(space, 4));
}
*/
