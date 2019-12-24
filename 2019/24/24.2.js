//  24   00:11:57   124      0   00:56:33   203      0
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
let SIZE = map.length;
let MID = Math.floor(map.length/2);

let posExpand = (pos) => {
    let dip = pos[2];
    let res = [
      [pos[0]+1,pos[1], dip],
      [pos[0]-1,pos[1], dip],
      [pos[0],pos[1]+1, dip],
      [pos[0],pos[1]-1, dip]
    ]
    if (pos[0]===0) {
        res = [...res,
            [MID-1,MID, dip+1]
        ];
    }
    if (pos[1]===0) {
        res = [...res,
            [MID,MID-1, dip+1]
        ];
    }
    if (pos[0]===SIZE-1) {
        res = [...res,
            [MID+1,MID, dip+1]
        ];
    }
    if (pos[1]===SIZE-1) {
        res = [...res,
            [MID,MID+1, dip+1]
        ];
    }
    if (pos[0] === MID+1 && pos[1]===MID) {
        for(let i=0;i<SIZE;++i) {
            res.push([SIZE-1, i, dip-1])
        }
    }
    if (pos[0] === MID-1 && pos[1]===MID) {
        for(let i=0;i<SIZE;++i) {
            res.push([0, i, dip-1])
        }
    }
    if (pos[1] === MID-1 && pos[0]===MID) {
        for(let i=0;i<SIZE;++i) {
            res.push([i, 0, dip-1])
        }
    }
    if (pos[1] === MID+1 && pos[0]===MID) {
        for(let i=0;i<SIZE;++i) {
            res.push([i, SIZE-1, dip-1])
        }
    }
    return res;
}
/*
console.log(SIZE, MID, posExpand([0,4,1]))
console.log(SIZE, MID, posExpand([4,0,1]))
console.log(SIZE, MID, posExpand([2,3,1]))
console.log(SIZE, MID, posExpand([2,1,1]))
console.log(SIZE, MID, posExpand([3,3,1]))
console.log(SIZE, MID, posExpand([3,2,1]))
console.log(SIZE, MID, posExpand([1,2,1]))
*/
let bdv = (map, dip) => {
    let lval = 1;
    let res = 0;
    for(let i=0;i<map.length;++i) {
        for(let j=0;j<map.length;++j) {
            if (_.get(map, [i,j,dip], '.') === '#') {
                res+=lval;
            }
            lval *= 2;
        }
    }
    return res;
}
let ddv = (map, dip) => {
    for(let i=0;i<map.length;++i) {
        let line = [];
        for(let j=0;j<map.length;++j) {
            line.push(_.get(map, [i,j,dip], '.'));            
        }
        console.log(line)
    }
}

let bdv2 = (map, dip) => {
    let sum = 0;
    for(let i=0;i<map.length;++i) {
        for(let j=0;j<map.length;++j) {
            //line.push(_.get(map, [i,j,dip], '.'));            
            if (_.get(map, [i,j,dip], '.') === '#') ++sum;
        }
    }
    return sum;
}

let map3d = [];
let idip = 0;
for(let i=0;i<map.length;++i) {
    for(let j=0;j<map.length;++j) {
        _.set(map3d, [i,j,idip], map[i][j]);
    }
}
let dipdiv = 1;
//console.log(bdv(map3d, 1))
let step = (map, dipdiv) => {
    let nmap = [];
    for(let i=0;i<map.length;++i) {
        for(let j=0;j<map.length;++j) {
            if (i===MID && j === MID) {
                continue;
            }
            for(let k=-dipdiv;k<=dipdiv;++k) {
                let pp = [i,j,k]
                let neigh = posExpand(pp);
                let op = _.get(map, pp, '.');
                neigh = neigh.filter(np => _.get(map, np, '.') === '#');
                if (op === '.' && (neigh.length === 1 || neigh.length === 2)) {
                    _.set(nmap, pp, '#');
                } else 
                if (op === '#' && (neigh.length !== 1)) {
                    _.set(nmap,pp, '.');
                } else 
                _.set(nmap, pp, op);    
            }
        }
    }
    if (bdv(map, -dipdiv)!==0 ||bdv(map, dipdiv)!==0) {
        ++dipdiv;
    }
    return [nmap, dipdiv];
}

let STEPS = 200

for(let i=0;i<STEPS;++i) {
    [map3d, dipdiv] = step(map3d, dipdiv);
    //console.log(dipdiv)
}
let tsum = 0;
for(let k=-dipdiv;k<=dipdiv;++k) {
    //console.log(k);
    //ddv(map3d, k)
    tsum += bdv2(map3d, k);
}
console.log(tsum)

/*
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
*/