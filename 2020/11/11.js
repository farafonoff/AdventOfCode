const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')
const _ = require('lodash');
const { runInNewContext } = require('vm');
function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}

var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(''));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content

const adjs = [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1], [-1, 1], [-1, -1], [1, -1]]

function next(map) {
    return map.map((row, idx) => row.map((seat, sidx) => {
        let countOccupied = 0
        adjs.forEach(ad => {
            let val = _.get(map, [idx+ad[0], sidx+ad[1]], '.');
            if (val === '#') {
                ++countOccupied;
            }
        })
        if (seat === 'L') {
            if (countOccupied === 0) {
                return '#'
            }
        }
        if (seat === '#') {
            if (countOccupied >=4 ) {
                return 'L'
            }
        }
        return seat;
    }))    
}

function log(map) {
    map.forEach(r => console.log(r.join('')))
    console.log('===')
}

function runTillDone(contents, mover) {
  let m1 = _.cloneDeep(contents);
  for (let i = 0; i < 100000; ++i) {
    let m11 = mover(m1);
    if (_.isEqual(m11, m1)) {
      return m1;
    }
    m1 = m11;
  }
}

function compAns(contents) {
    return contents.reduce((sum, row) => {
      return sum + row.filter((ch) => ch === "#").length;
    }, 0);
}

console.log(compAns(runTillDone(contents, next)))

function move(mm, start, direction) {
    let rv;
    let rc = start;
    do {
        rc = [rc[0] + direction[0], rc[1]+direction[1]]
        rv = _.get(mm, rc, '$')
    } while (rv === '.')
    return rv;
}

function next2(map) {
  return map.map((row, idx) =>
    row.map((seat, sidx) => {
      let countOccupied = 0;
      adjs.forEach((ad) => {
        let val = move(map, [idx, sidx], ad);
        if (val === "#") {
          ++countOccupied;
        }
      });
      if (seat === "L") {
        if (countOccupied === 0) {
          return "#";
        }
      }
      if (seat === "#") {
        if (countOccupied > 4) {
          return "L";
        }
      }
      return seat;
    })
  );
}

console.log(compAns(runTillDone(contents, next2)));