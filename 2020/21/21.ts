const fs = require("fs");
const HM = require("hashmap");
const md5 = require("js-md5");
const PQ = require("js-priority-queue");
const _ = require("lodash");
const infile = process.argv[2] || "input";

function trnum(val) {
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

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let list = [];
contents.forEach((line) => {
  //console.log(line)
  let mm = line.match(/(.*) \(contains (.*)\)/).slice(1);
  let ing = mm[0].split(" ").sort();
  let alg = mm[1].split(", ").sort();
  list.push({ ing, alg });
});

function isect(f1, f2) {
  return {
    ing: _.intersection(f1.ing, f2.ing),
    alg: _.intersection(f1.alg, f2.alg),
  };
}

let isec1 = [];

function isecs(list) {
  let isec1 = [];
  list.forEach((f1) => {
    list.forEach((f2) => {
      isec1.push(isect(f1, f2));
    });
  });
  return _.uniqWith(isec1, _.isEqual);
}

function remove(fd, fd1) {
  return {
    ing: _.difference(fd.ing, fd1.ing),
    alg: _.difference(fd.alg, fd1.alg),
  };
}

let olist = _.cloneDeep(list);

let algs = _.uniq(list.map((it) => it.alg).reduce((a, b) => _.concat(a, b)));

//console.log(algs);

let algIng = new Map();
algs.forEach((alg) => {
  let mv = algIng.get(alg);
  mv = list.filter((pr) => {
    return pr.alg.indexOf(alg) !== -1;
  });
  algIng.set(alg, mv);
});
//console.log(algIng);

let lolmap = new Map();

algs.forEach((alg) => {
  let prds = algIng.get(alg);
  let isec = isecs(prds).filter((is) => is.alg.length == 1);
  //console.log(alg);
  // console.log(isec);
  for (let i = 0; i < 5; ++i) {
    let shortest = isec.sort((pr1, pr2) => pr1.ing.length - pr2.ing.length)[0];
    //console.log(shortest);
    let reduced = isec.map((it) => isect(shortest, it));
    isec = _.uniqWith(reduced, _.isEqual);
  }
  //console.log(isec);
  lolmap.set(alg, isec[0]);
  //console.log(isec.find((it) => it.ing.length === it.alg.length));
});
let anz = new Map();
let ianz = new Map();
for (let i = 0; i < 10; ++i) {
  lolmap.forEach((val, key) => {
    //console.log(val, key);
    if (val.ing.length === 1) {
      let nlmap = new Map();
      anz.set(key, val.ing[0]);
      ianz.set(val.ing[0], key);
      lolmap.forEach((v1, k1) => {
        if (k1 !== key) {
          nlmap.set(k1, remove(v1, val));
        }
      });
      lolmap = nlmap;
    }
  });
}

console.log(
  olist
    .map((it) => it.ing)
    .reduce((a, b) => _.concat(a, b))
    .filter((ig) => !ianz.has(ig)).length
);

const keyz = Array.from(anz.keys());
keyz.sort();
const a2 = keyz.map((k) => anz.get(k)).join(",");
console.log(a2);
