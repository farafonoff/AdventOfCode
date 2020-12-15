const fs = require("fs");
const HM = require("hashmap");
const md5 = require("js-md5");
const PQ = require("js-priority-queue");
const { isFinite, map } = require("lodash");
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
  .filter((s) => s.length > 0)
  .map((s) => s.split(",").map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
contents.forEach((content) => {
  let a1;
  const meme = new Map();
  let last;
  content.forEach((n, id) => {
    meme.set(n, [id]);
    last = n;
  });
  for (let i = content.length; i < 30000000; ++i) {
    let poz = meme.get(last);
    let next;
    if (poz.length < 2) {
      next = 0;
    } else {
      next = poz[poz.length - 1] - poz[poz.length - 2];
    }
    let apos = meme.get(next);
    if (!apos) apos = [];
    apos.push(i);
    meme.set(next, apos);
    if (i === 2020) console.log(last);
    last = next;
  }
  console.log(last);
  console.log('======')
});
