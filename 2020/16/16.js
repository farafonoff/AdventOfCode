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
function trnum(val) {
  let nn = Number(val);
  if (isFinite(nn)) {
    return nn;
  }
  return val;
}
let dpart = 0;
const parts = [[], [], []];
contents.forEach((line) => {
  if (line.startsWith("your ")) {
    dpart = 1;
  } else if (line.startsWith("nearby ")) {
    dpart = 2;
  } else {
    let parsed;
    switch (dpart) {
      case 0:
        parsed = line
          .match(/^([\w ]+): (\d+)-(\d+) or (\d+)-(\d+)$/)
          .slice(1)
          .map(trnum);
        break;
      default:
        parsed = line.split(",").map(trnum);
    }
    parts[dpart].push(parsed);
  }
});
function tryMatch(num, fields) {
  return fields.filter((fld) => {
    return (num >= fld[1] && num <= fld[2]) || (num >= fld[3] && num <= fld[4]);
  });
}

let filtered = [];

function part1() {
  let ans = 0;
  parts[2].forEach((ticket) => {
    let valid = true;
    ticket.forEach((field) => {
      let opts = tryMatch(field, parts[0]);
      ans += opts.length > 0 ? 0 : field;
      if (!opts.length) valid = false;
    });
    if (valid) {
      filtered.push(ticket);
    }
  });
  return ans;
}
console.log(part1());
let optionz = [];
parts[0].forEach((_field, idx) => {
  let remaining = parts[0];
  filtered.forEach((ticket) => {
    remaining = tryMatch(ticket[idx], remaining);
  });
  optionz[idx] = remaining;
});

for (let i = 0; i < 20; ++i) {
  let singles = optionz.filter((opt) => opt.length === 1).map((opt) => opt[0]);
  //console.log(singles);
  optionz = optionz.map((opt) => {
    if (opt.length === 1) {
      return opt;
    } else {
      let elim = _.filter(opt, (fld) => {
        let anySingle = singles.filter((sng) => sng[0] === fld[0]);
        return anySingle.length === 0;
      });
      //console.log(opt, elim);
      return elim;
    }
  });
}
optionz = _.zip(
  optionz.map((op) => op[0][0]),
  parts[1][0]
)
  .filter((op) => op[0].startsWith("departure"))
  .map((f) => {
    console.log(f);
    return f;
  })
  .reduce((a, v) => a * v[1], 1);
console.log(optionz);
