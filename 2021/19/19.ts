import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _, { matches } from "lodash";
import { transform } from "typescript";
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

function incHM(tab: HM<unknown, number>, key: unknown, inc: number, dv = 0) {
  let ov = tab.get(key) || dv;
  tab.set(key, ov + inc);
}
let DEBUG = false;

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
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let scanners = {};
let scaname = "";
let snm = (num) => `--- scanner ${num} ---`;
contents.forEach((line) => {
  if (line.startsWith("---")) {
    scaname = line;
  } else {
    scanners[scaname] = scanners[scaname]
      ? [...scanners[scaname], line.split(",").map(Number)]
      : [line.split(",").map(Number)];
  }
});

function vectorz(scanner: number[][]) {
  let result = [];
  scanner.forEach((sn1, i1) => {
    scanner.forEach((sn2, i2) => {
      if (i2 <= i1) return;
      result.push([dif(sn1, sn2), sn1, sn2]);
    });
  });
  return result;
}
/* cos -sin */
/* sin  cos */

let rt2d = [
  [
    [0, -1],
    [1, 0],
  ],
  [
    [-1, 0],
    [0, -1],
  ],
  [
    [0, 1],
    [-1, 0],
  ],
];

let ref180 = [
  [-1, 0],
  [0, -1],
];

function rtX(m) {
  return [
    [1, 0, 0],
    [0, m[0][0], m[0][1]],
    [0, m[1][0], m[1][1]],
  ];
}

function rtY(m) {
  return [
    [m[1][1], 0, m[1][0]],
    [0, 1, 0],
    [m[0][1], 0, m[0][0]],
  ];
}

function rtZ(m) {
  return [
    [m[0][0], m[0][1], 0],
    [m[1][0], m[1][1], 0],
    [0, 0, 1],
  ];
}

let rotovec = [
  [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
];

function matprod2(matrix: number[][], matrix2: number[][]) {
  let result = matrix.map((row, rownum) =>
    matrix2.map((mr2, rn2) =>
      _.sum(
        _.zip(
          row,
          matrix2.map((mr) => mr[rn2])
        ).map(([p1, p2]) => p1 * p2)
      )
    )
  );
  return result;
}

[rtX, rtY, rtZ].forEach((axi) => {
  rt2d.forEach((r2d) => {
    rotovec.push(axi(r2d));
  });
});

[rtX, rtY, rtZ].forEach((axi) => {
  rt2d.forEach((r2d) => {
    //rotovec.push(axi(r2d));
    rotovec = [
      ...rotovec,
      ...rotovec.map((oldm) => {
        return matprod2(oldm, axi(r2d));
      }),
    ];
    rotovec = _.uniqWith(rotovec, _.isEqual);
    // rotovec.push(axi(r2d));
  });
});
rotovec = _.uniqWith(rotovec, _.isEqual);

[rtX, rtY, rtZ].forEach((axi) => {
  rt2d.forEach((r2d) => {
    //rotovec.push(axi(r2d));
    rotovec = [
      ...rotovec,
      ...rotovec.map((oldm) => {
        return matprod2(oldm, axi(r2d));
      }),
    ];
    rotovec = _.uniqWith(rotovec, _.isEqual);
    // rotovec.push(axi(r2d));
  });
});
rotovec = _.uniqWith(rotovec, _.isEqual);

function matprod(vector: number[], matrix: number[][]) {
  let result = matrix.map((row) =>
    _.sum(_.zip(row, vector).map(([p1, p2]) => p1 * p2))
  );
  return result;
}

function allrots(vector) {
  let result = [];
  result.push(vector);
  rotovec.forEach((rv) => {
    let roted = matprod(vector, rv);
    result.push(roted);
  });
  return result;
}
/*
rotovec = [];

function buildAllRotz(cn, ra) {
  if (cn === 9) {
    rotovec.push(_.chunk(ra, 3));
    return;
  }
  for (let v = -1; v <= 1; ++v) {
    ra[cn] = v;
    buildAllRotz(cn + 1, ra);
  }
}

buildAllRotz(0, []);

dbg(rotovec[0]);
dbg(rotovec[1]);
*/
let veclen = (vec) => _.sum(vec.map((vs) => vs * vs));
let MIN_POINTS = 12;
let MIN_MATCHES = ((n: number) => (n * (n - 1)) / 2)(MIN_POINTS);
dbg(MIN_MATCHES, "min_mathces");
function neg(ve) {
  return ve.map((v) => -v);
}
function dif(ve: number[], v1: number[]) {
  return _.zip(ve, v1).map(([c1, c2]) => c1 - c2);
}
function match(scanner1: number[][], scanner2: number[][]) {
  let vec1 = vectorz(scanner1);
  let vec2 = vectorz(scanner2);
  //dbg(vec1.length);
  //dbg(vec2.length);
  let potentialMatches = [];
  let Btable = new HM<number, any[]>();
  vec2.forEach((vecB, iB) => {
    let key = veclen(vecB[0]);
    let value = Btable.get(key) || [];
    value.push(iB);
    Btable.set(key, value);
  });
  vec1.forEach((vecA, iA) => {
    let vlA = veclen(vecA[0]);
    let eqvs = Btable.get(vlA);
    if (eqvs && eqvs.length) {
      eqvs.forEach((evv) => potentialMatches.push([iA, evv]));
    }
  });
  if (potentialMatches.length < MIN_MATCHES) {
    //dbg(potentialMatches.length, "distance mathces");
    throw "distance check failed";
  }
  let rotation = rotovec.filter((rv) => {
    let mismatches = 0;
    potentialMatches.forEach((pm) => {
      let matched = _.isEqual(vec1[pm[0]][0], matprod(vec2[pm[1]][0], rv));
      let matched1 = _.isEqual(
        neg(vec1[pm[0]][0]),
        matprod(vec2[pm[1]][0], rv)
      );
      if (!matched && !matched1) ++mismatches;
    });
    return mismatches <= potentialMatches.length - MIN_POINTS;
  });
  let foundRotation = rotation[0];
  dbg(rotation[0], "rotation");
  if (rotation.length !== 1) {
    //dbg(rotation);
    throw "non-uniq rotation";
  }
  scanner2 = scanner2.map((sp) => matprod(sp, foundRotation));
  let matchedPair = [];
  try {
    potentialMatches.forEach((pm) => {
      let rotated = matprod(vec2[pm[1]][0], foundRotation);
      let source = vec1[pm[0]][0];
      let matched = _.isEqual(source, rotated);
      let matched1 = _.isEqual(neg(source), rotated);
      let mp2v = matprod(vec2[pm[1]][1], foundRotation);
      if (matched) {
        matchedPair = [vec1[pm[0]][1], mp2v];
        throw "mp";
      }
      if (matched1) {
        matchedPair = [vec1[pm[0]][2], mp2v];
        throw "mp";
      }
    });
  } catch (_) {}
  dbg(matchedPair);
  let translate = [dif(matchedPair[1], matchedPair[0])];
  /*  let s2points = new HM();
  scanner2.forEach((sp) => s2points.set(sp, 1));
  let translate;
  try {
    translate = _.uniqWith(
      scanner1
        .map((sp1) => {
          let deltaList = scanner2
            .map((sp2) => {
              let delta = dif(sp2, sp1);
              let negdelta = neg(delta);
              let matcheds = scanner1.filter((sv1) => {
                let transformed = dif(sv1, negdelta);
                return s2points.has(transformed);
              });
              if (matcheds.length >= MIN_POINTS) throw delta;
              return matcheds.length >= MIN_POINTS ? delta : null;
            })
            .filter((f) => !!f);
          return deltaList[0];
        })
        .filter((dl) => !!dl),
      _.isEqual
    );
  } catch (delta) {
    translate = [delta];
  }*/
  dbg(translate[0], "translation");
  if (translate.length !== 1) {
    //dbg(translate);
    throw "non-uniq translation";
  }
  let translated = scanner2.map((sv) => dif(sv, translate[0]));
  let s1s = scanner1.length;
  let s2s = scanner2.length;
  //let result = [...scanner1, ...translated];
  let result = _.uniqWith([...scanner1, ...translated], _.isEqual);
  let rs = result.length;
  dbg(rs - s1s - s2s, "overlap");
  dbg([s1s, s2s, rs], "result size");
  return [result, translate[0]];
}

//dbg(scanners);
//dbg(vectorz(scanners[snm(0)]));
//dbg(rotovec.length);
//dbg(allrots([8, 0, 7]));
/*let bmap = Object.entries(scanners).reduce(([_n, cbeacons], [nm, beacons]) => {
  dbg(cbeacons);
  dbg(beacons);
  let data = match(cbeacons as number[][], beacons as number[][]);
  dbg(data.length, nm);
  return [nm, data];
});
dbg(bmap.length);*/
let clouds = Object.keys(scanners).map((sn) => scanners[sn]);
/*while (clouds.length > 1) {
  dbg(clouds.length, "CLOUDS LEFT");
  let cl = clouds[0];
  let rest = clouds.slice(1);
  let merged = false;
  for (let i = 0; i < rest.length; ++i) {
    try {
      let result = match(_.cloneDeep(cl), _.cloneDeep(rest[i]));
      rest[i] = result;
      merged = true;
      break;
    } catch (_) {
      //dbg(_);
    }
  }
  if (merged) {
    ///clouds = dbg([...rest], "MERGED");
    clouds = [...rest];
  } else {
    clouds = [...rest, cl];
    //dbg(clouds);
    //dbg(clouds.length);
    dbg(_.sum(clouds.map((cm) => cm.length)));
  }
}*/
let mergeResult = clouds[0];
let rest = clouds.slice(1);
let centers = [[0, 0, 0]];
while (rest.length) {
  rest = rest.filter((rcloud) => {
    try {
      let [result, translate] = match(
        _.cloneDeep(mergeResult),
        _.cloneDeep(rcloud)
      );
      centers.push(translate);
      mergeResult = result;
      return false;
    } catch (_) {
      return true;
    }
  });
}
answer(1, mergeResult.length);
let mhd = (cv) => Math.abs(cv[0]) + Math.abs(cv[1]) + Math.abs(cv[2]);
let max = 0;
dbg(centers);
centers.forEach((c1) => {
  centers.forEach((c2) => {
    let dist = mhd(dif(c1, c2));
    max = Math.max(max, dist);
  });
});
answer(2, max);
/*Object.keys(scanners).forEach((ks1, id1) => {
  Object.keys(scanners).forEach((ks2, id2) => {
    if (id2 <= id1) return;
    let scn1 = scanners[ks1];
    let scn2 = scanners[ks2];
    dbg([ks1, ks2], "start");
    try {
      let result = match(_.cloneDeep(scn1), _.cloneDeep(scn2));
      dbg([ks1, ks2], "success");
    } catch (_) {
      dbg(_, "failed");
    }
  });
});*/
//dbg(match(scanners[snm(0)], scanners[snm(1)]));
