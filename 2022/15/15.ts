import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _, { delay, isNumber } from "lodash";
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
  .filter((s) => s.length > 0)
  .map((s) => s.replace(/[=:,]/g, " "))
  .map((s) =>
    s
      .split(" ")
      .map(trnum)
      .filter((t) => isNumber(t))
  );
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content

function sv1(y, contents) {
  let segments = [];
  let mb = new Set();
  let mb2 = new Set();
  contents.forEach((line) => {
    let dx = line[0] - line[2];
    let dy = line[1] - line[3];
    let mhd = Math.abs(dx) + Math.abs(dy);
    let dy2 = Math.abs(y - line[1]);
    let dyl = mhd - dy2;
    if (dyl > 0) {
      let seg = [line[0] - dyl, line[0] + dyl];
      segments.push(seg);
    }
    if (line[3] === y) {
      mb.add(line[2]);
    }
    if (line[1] === y) {
      mb2.add(line[0]);
    }
  });
  let srs = [];
  segments.sort((b, a) => b[0] - a[0]);
  segments.forEach((ss) => {
    let lss = [...ss];
    dbg(lss, "before");
    srs.forEach((sr) => {
      if (sr[0] <= lss[0] && sr[1] >= lss[0]) {
        lss[0] = sr[1] + 1;
      }
      if (sr[0] <= lss[1] && sr[1] >= lss[1]) {
        lss[1] = sr[0] - 1;
      }
    });
    dbg(lss, "after");
    if (lss[1] >= lss[0]) {
      srs.push(lss);
    } else dbg("drop");
  });
  dbg(segments);
  dbg(srs);
  let srs2 = [];
  let ps;
  srs.forEach((sr) => {
    if (!ps) {
      ps = sr;
      srs2.push(sr);
    } else {
      if (sr[0] - ps[1] === 1) {
        ps[1] = sr[1];
      } else {
        ps = sr;
        srs2.push(sr);
      }
    }
  });
  let ans = 0;
  srs2.forEach((sr) => {
    let lv = sr[1] - sr[0] + 1;
    dbg(lv);
    ans += lv;
    //if (sr[1] > sr[0]) ans += 1;
  });
  //srs.sort((b, a) => b[0] - a[0]);
  dbg(srs2);
  //dbg(mb.values());
  //dbg(mb2.values());
  return ans - mb.size;
}

function sv2(y, contents) {
  let segments = [];
  let mb = new Set();
  let mb2 = new Set();
  contents.forEach((line) => {
    let dx = line[0] - line[2];
    let dy = line[1] - line[3];
    let mhd = Math.abs(dx) + Math.abs(dy);
    let dy2 = Math.abs(y - line[1]);
    let dyl = mhd - dy2;
    if (dyl > 0) {
      let seg = [line[0] - dyl, line[0] + dyl];
      segments.push(seg);
    }
    if (line[3] === y) {
      mb.add(line[2]);
    }
    if (line[1] === y) {
      mb2.add(line[0]);
    }
  });
  let srs = [];
  segments.sort((b, a) => b[0] - a[0]);
  segments.forEach((ss) => {
    let lss = [...ss];
    dbg(lss, "before");
    srs.forEach((sr) => {
      if (sr[0] <= lss[0] && sr[1] >= lss[0]) {
        lss[0] = sr[1] + 1;
      }
      if (sr[0] <= lss[1] && sr[1] >= lss[1]) {
        lss[1] = sr[0] - 1;
      }
    });
    dbg(lss, "after");
    if (lss[1] >= lss[0]) {
      srs.push(lss);
    } else dbg("drop");
  });
  let ans = 0;
  srs.forEach((sr) => {
    let lv = sr[1] - sr[0] + 1;
    dbg(lv);
    ans += lv;
    //if (sr[1] > sr[0]) ans += 1;
  });
  //srs.sort((b, a) => b[0] - a[0]);
  let srs2 = [];
  let ps;
  srs.forEach((sr) => {
    if (!ps) {
      ps = sr;
      srs2.push(sr);
    } else {
      if (sr[0] - ps[1] === 1) {
        ps[1] = sr[1];
      } else {
        ps = sr;
        srs2.push(sr);
      }
    }
  });
  let holes = [];
  if (srs2.length > 2) {
    throw "bigbig";
  }
  if (srs2.length > 1) {
    holes.push(srs2[0][1] + 1);
  }
  //dbg(mb.values());
  //dbg(mb2.values());
  //return ans - mb.size;
  return holes;
}

/*answer(1, sv1(9, contents));
answer(1, sv1(10, contents));
answer(1, sv1(11, contents));*/
DEBUG = false;
if (infile === "input.test") {
  answer(1, sv1(10, contents));
  for (let yv = 0; yv <= 20; ++yv) {
    let holes = sv2(yv, contents);
    if (holes.length) {
      answer(2, holes[0] * 4000000 + yv);
    }
  }
} else {
  answer(1, sv1(2000000, contents));
  for (let yv = 0; yv <= 4000000; ++yv) {
    let holes = sv2(yv, contents);
    if (holes.length) {
      answer(2, holes[0] * 4000000 + yv);
    }
  }
}

//-207767 -- - 151589 -- -151588 -- 1484434 -- 1484435 -- 2551408
// 2551409 -- 3655999 -- 3656000 -- 4892696
