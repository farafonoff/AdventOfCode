import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
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

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let seq = contents[0].split(",").map(Number);
let grids = contents.slice(1);
let grdata = [];
let markz = new HM();
let winners = new HM();
for (let i = 0; i < grids.length / 5; ++i) grdata.push([]);

grids.forEach((line, idx) => {
  grdata[Math.floor(idx / 5)][idx % 5] = line.split(/[ ]+/).map(Number);
});
let answers = [];

//console.log(grdata);
seq.forEach((inum) => {
  grdata.forEach((grid, gridid) => {
    if (winners.has(gridid)) return;
    grid.forEach((row, rowid) => {
      row.forEach((col, colid) => {
        if (col === inum) {
          markz.set([gridid, rowid, colid], true);
          let marks1 = 0;
          grid.forEach((wrow, wrowid) => {
            if (markz.has([gridid, wrowid, colid])) ++marks1;
          });
          let marks2 = 0;
          row.forEach((wcol, wcolid) => {
            if (markz.has([gridid, rowid, wcolid])) ++marks2;
          });
          if (marks1 === 5 || marks2 === 5) {
            let winner = gridid;
            let called = inum;
            winners.set(winner, true);
            //console.log("WIN", winner, called);
            let sum = 0;
            grdata[winner].forEach((row, rowid) => {
              row.forEach((col, colid) => {
                if (!markz.has([winner, rowid, colid])) sum += col;
              });
            });
            //console.log(sum * called);
            answers.push(sum * called);
          }
        }
      });
    });
  });
});
console.log(_.first(answers));
console.log(_.last(answers));
