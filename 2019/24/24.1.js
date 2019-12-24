const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')
const _ = require('lodash')
function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}

var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
let map = [];
contents.forEach(line => {
    map.push(line.split(''));
})

let posExpand = (pos) => {
    let res = [
      [pos[0]+1,pos[1]],
      [pos[0]-1,pos[1]],
      [pos[0],pos[1]+1],
      [pos[0],pos[1]-1]
    ]
    return res;
}

let bdv = (map) => {
    let lval = 1;
    let res = 0;
    for(let i=0;i<map.length;++i) {
        for(let j=0;j<map.length;++j) {
            if (map[i][j] === '#') {
                res+=lval;
            }
            lval *= 2;
        }
    }
    return res;
}

let step = (map) => {
    let nmap = [];
    for(let i=0;i<map.length;++i) {
        for(let j=0;j<map.length;++j) {
            let neigh = posExpand([i,j]);
            neigh = neigh.filter(np => _.get(map, np, '.') === '#');
            if (_.get(map, [i,j]) === '.' && (neigh.length === 1 || neigh.length === 2)) {
                _.set(nmap, [i, j], '#');
            } else 
            if (_.get(map, [i,j]) === '#' && (neigh.length !== 1)) {
                _.set(nmap, [i, j], '.');
            } else 
            _.set(nmap, [i, j], map[i][j]);
        }
    }
    return nmap
}

let bdvs = [];
let bv = bdv(map);
while(true) {
    bdvs[bv] = 1;
    map = step(map);
    bv = bdv(map);
    if (bdvs[bv]) {
        console.log(bv);
        break;
    }
}
