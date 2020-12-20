const fs = require("fs");
const HM = require("hashmap");
const md5 = require("js-md5");
const PQ = require("js-priority-queue");
const { rangeRight } = require("lodash");
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
function trnum(val) {
  let nn = Number(val);
  if (isFinite(nn)) {
    return nn;
  }
  return val;
}

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let tiles = [];
let tile = null;
contents.forEach((line) => {
  const tm = line.match(/Tile (\d+):$/);
  if (tm) {
    if (tile) {
      tiles.push(tile);
    }
    tile = {
      id: trnum(tm[1]),
      data: [],
      unbounds: 0,
      neighs: [],
    };
  } else {
    tile.data.push(line.split(""));
  }
});
tiles.push(tile);
function getEdges(arr) {
  let result = [arr[0], arr[arr.length - 1]];
  result.push(arr.map((rr) => rr[0]));
  result.push(arr.map((rr) => rr[rr.length - 1]));
  result = [...result, ...result.map((res) => [...res].reverse())].map((edge) =>
    edge.join("")
  );
  return result;
}
tiles.forEach((tile) => {
  tile.edges = getEdges(tile.data);
});
//console.log(tiles);
let edgeMap = new Map();
let tileMap = new Map(tiles.map((til) => [til.id, til]));
tiles.forEach((tile) => {
  tile.edges.forEach((edge) => {
    let edval = edgeMap.get(edge);
    if (edval) {
      edval.push(tile);
    } else {
      edval = [tile];
    }
    edgeMap.set(edge, edval);
  });
});
edgeMap.forEach((val, key) => {
  if (val.length === 1) {
    val[0].unbounds++;
  }
});
//console.log(edgeMap);
//console.log(tiles);
let angls = tiles.filter((tile) => tile.unbounds === 4).map((tile) => tile.id);
console.log(
  "Part 1:",
  angls.reduce((acc, ang) => acc * ang, 1)
);
//let bordrs = tiles.filter((tile) => tile.unbounds === 2).map((tile) => tile.id);
let adjs = [];
edgeMap.forEach((val, key) => {
  let rib = val.map((ti) => ti.id);
  if (rib.length === 2) {
    adjs.push(rib);
    tileMap.get(rib[0]).neighs.push(tileMap.get(rib[1]).id);
    tileMap.get(rib[1]).neighs.push(tileMap.get(rib[0]).id);
  }
});
tiles.forEach((til) => {
  til.neighs = _.uniq(til.neighs);
});
//console.log(adjs);

let useds = [angls[0]];
let itile = tileMap.get(angls[0]);
let tmap = [[itile.id]];
let ctile = itile;
//first row
while (true) {
  // console.log(ctile, ctile.neighs);
  let next = ctile.neighs
    .map((ne) => tileMap.get(ne))
    .filter((ne) => ne.unbounds === 2 || ne.unbounds === 4)
    .filter((ne) => useds.indexOf(ne.id) === -1)[0];
  if (next) {
    tmap[0].push(next.id);
    useds.push(next.id);
    ctile = next;
  } else {
    break;
  }
  if (next.unbounds === 4) {
    break;
  }
}
for (let row = 0; row < 100; ++row) {
  let newRow = [];
  _.last(tmap).forEach((cell) => {
    let ctile = tileMap.get(cell);
    let next = ctile.neighs
      .map((ne) => tileMap.get(ne))
      .filter((ne) => useds.indexOf(ne.id) === -1)[0];
    if (next) {
      newRow.push(next.id);
      useds.push(next.id);
      ctile = next;
    }
  });
  if (newRow.length) {
    tmap.push(newRow);
  } else {
    break;
  }
}
function rot(data) {
  let res = [];
  for (let col = 0; col < data[0].length; ++col) {
    res.push(data.map((r) => r[col]).reverse());
  }
  return res;
}
function flip(data) {
  return data.map((row) => {
    return [...row].reverse();
  });
}
function allPoz(data) {
  let res = [];
  let tmp = data;
  for (let i = 0; i < 4; ++i) {
    res.push(tmp);
    tmp = rot(tmp);
  }
  tmp = flip(tmp);
  for (let i = 0; i < 4; ++i) {
    res.push(tmp);
    tmp = rot(tmp);
  }
  return res;
}
function joinRight(data1, data2) {
  let alls = allPoz(data2);
  let righEdge = data1.map((row) => _.last(row)).join("");
  let res;
  alls.forEach((ap) => {
    let leftEdge = ap.map((row) => row[0]).join("");
    if (leftEdge === righEdge) {
      res = ap;
    }
  });
  return res;
}
function joinBelow(data1, data2) {
  let alls = allPoz(data2);
  let bottomEdge = _.last(data1).join("");
  let res;
  alls.forEach((ap) => {
    let topEdge = ap[0].join("");
    if (bottomEdge === topEdge) {
      res = ap;
    }
  });
  return res;
}

// console.log(tmap);
tmap.forEach((row, ridx) => {
  row.forEach((col, cidx) => {
    if (ridx === 0) {
      if (cidx === 0) {
        //do nothing
      } else if (cidx === 1) {
        let first = tileMap.get(tmap[0][0]);
        let allfirst = allPoz(first.data);
        let second = tileMap.get(tmap[0][1]);
        let below = tileMap.get(tmap[1][0]);
        allfirst.forEach((frot) => {
          let cand = joinRight(frot, second.data);
          let cand2 = joinBelow(frot, below.data);
          if (cand && cand2) {
            first.data = frot;
            second.data = cand;
            below.data = cand2;
          }
        });
      } else {
        let first = tileMap.get(row[cidx - 1]);
        let curr = tileMap.get(col);
        let cand = joinRight(first.data, curr.data);
        curr.data = cand;
      }
    } else {
      let top = tileMap.get(tmap[ridx - 1][cidx]);
      let curr = tileMap.get(col);
      let cand = joinBelow(top.data, curr.data);
      curr.data = cand;
    }
  });
});
let img = [];
function cutBorders(data) {
  let dsize = data.length;
  return data.slice(1, dsize - 1).map((row) => row.slice(1, dsize - 1));
}
tmap.forEach((row, ridx) => {
  row.forEach((col, cidx) => {
    let til = cutBorders(tileMap.get(col).data);
    let rsize = til.length;
    til.forEach((trow, tirdx) => {
      let imrow = _.get(img, [ridx * rsize + tirdx], []);
      trow.forEach((vl) => imrow.push(vl));
      _.set(img, [ridx * rsize + tirdx], imrow);
    });
  });
});

const seaMonster = [
  "                  # ",
  "#    ##    ##    ###",
  " #  #  #  #  #  #   ",
];

let seaData = seaMonster.map((s) => s.split(""));
function findMonster(img, ridx, cidx) {
  let found = true;
  for (let i = 0; i < seaData.length; ++i) {
    for (let j = 0; j < seaData[0].length; ++j) {
      let monsterTile = _.get(seaData, [i, j], " ");
      let imgTile = _.get(img, [ridx + i, cidx + j], " ");
      let match =
        (monsterTile === "#" && imgTile === "#") || monsterTile === " ";
      found = found && match;
    }
  }
  return found;
}

function drawMonster(img, ridx, cidx) {
  for (let i = 0; i < seaData.length; ++i) {
    for (let j = 0; j < seaData[0].length; ++j) {
      let monsterTile = _.get(seaData, [i, j], " ");
      //let imgTile = _.get(img, [ridx + i, cidx + j], ' ')
      if (monsterTile === "#") {
        _.set(img, [ridx + i, cidx + j], "O");
      }
    }
  }
}

function searchMonsters(img) {
  let count = 0;
  img.forEach((row, ridx) => {
    row.forEach((col, cidx) => {
      let found = findMonster(img, ridx, cidx);
      if (found) {
        drawMonster(img, ridx, cidx);
        ++count;
      }
    });
  });
  return count;
}

let allimgs = allPoz(img);
let color = true;

allimgs.forEach((rimg) => {
  let count = searchMonsters(rimg);
  if (count > 0) {
    let ans = 0;
    rimg.forEach((row) => {
      ans += row.filter((ch) => ch === "#").length;
      if (color) {
        console.log(row.join("").replace(/O/g, "\x1b[33mO\x1b[0m"));
      } else {
        console.log(row.join(""));
      }
    });
    console.log("Part 2:", ans);
  }
});
