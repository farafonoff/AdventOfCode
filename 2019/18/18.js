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
let ac = 'a'.charCodeAt(0);
let zc = 'z'.charCodeAt(0);
let AC = 'A'.charCodeAt(0);
let ZC = 'Z'.charCodeAt(0);
let isLC = (char) => char.charCodeAt(0)<=zc && char.charCodeAt(0)>=ac; 
let isUC = (char) => char.charCodeAt(0)<=ZC && char.charCodeAt(0)>=AC;
let toLC = (char) => String.fromCharCode(char.charCodeAt(0)-AC+ac);
let posExpand = (pos) => {
    let res = [
      [pos[0]+1,pos[1]],
      [pos[0]-1,pos[1]],
      [pos[0],pos[1]+1],
      [pos[0],pos[1]-1]
    ]
    return res;
}

let solvePart = (map, spos, allkeys) => {
    let charAt = (pos) => {
        return map[pos[0]][pos[1]]
    }
    let canStep = (pos, keys) => {
        let cap = charAt(pos)
        if (cap === '.') return true;
        if (cap === '#') return false;
        if (charAt(pos) === '@') return true;
        if (isLC(cap)) return true;
        if (isUC(cap)) {
            let result;
            if (keys[toLC(cap)]) result = true;
            else result = false;
            //console.log(pos, charAt(pos), keys, result)
            return result;
        }
        console.log('unknown', charAt(pos))
    }

    let accessibleFrom = (pos) => {
        let ist = _.cloneDeep({pos, steps: 0, mkeys: {}, jkeys: ''});
        let open = new PQ({ comparator: (s1, s2) => {
            if (s1.steps!==s2.steps) {
                return s1.steps - s2.steps;
            }
            if (s1.jkeys.length !== s2.jkeys.length) {
                return s2.jkeys.length - s1.jkeys.length;
            }
        }})
        open.queue(ist);
        let iter = 0;
        let c2 = [];
        let op = [];
    
        while(open.length) {
            let cstate = open.dequeue();
            let neigh = posExpand(cstate.pos).filter(npos => canStep(npos, cstate.mkeys))
            neigh.forEach(ne => {
                let ns = _.cloneDeep(cstate);
                ++ns.steps;
                ns.pos = ne;
                let nc = charAt(ne);
                if (isLC(nc)) {
                    if (!ns.mkeys[nc]) {
                        ns.mkeys[nc] = true;
                        let akeys = Object.keys(ns.mkeys);
                        akeys.sort();
                        ns.jkeys = akeys.join('');
                    }
                }
                if (!_.get(op, [ne[0],ne[1],ns.jkeys], false)) {
                    _.set(op, [ne[0],ne[1],ns.jkeys], true)
                    open.queue(ns)
                }
            });
            _.set(c2, [cstate.pos[0],cstate.pos[1],cstate.jkeys], cstate)
            if (cstate.jkeys.length === allkeys.length) {
                return cstate.steps;
            };
        }
    }
    return accessibleFrom(spos)
}

var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
let map = [];
let spos = [];
let allkeys = [];
contents.forEach(line => {
    let ll = line.split('')
    map.push(ll)
    let iss = line.indexOf('@');
    if (iss!==-1) {
        spos=[map.length-1, iss];
    }
    ll.forEach((lc, idx) => {
        if (isLC(lc)) allkeys.push(lc);
    })
})
//console.log(allkeys.sort(), allkeys.length)
//console.log(spos)
console.log('part1', solvePart(map, spos, allkeys));
let blocks = posExpand(spos);
blocks.forEach(block => map[block[0]][block[1]] = '#')
map[spos[0]][spos[1]] = '#';

let fix = (map) => {
    let keys = {}
    let doors = {}
    map.forEach(row => {
        row.forEach(char => {
            if (isLC(char)) {
                keys[char] = true;
            }
        })
    })
    map.forEach((row, i) => {
        row.forEach((char, j) => {
            if (isUC(char)&&!keys[toLC(char)]) {
                map[i][j] = '.';
            }
            if (isUC(char)) {
                doors[char] = true;
            }
        })
    })
    return Object.keys(keys);
}
let sum = 0;
for(let quad = 0;quad<4;++quad) {
    let division = [];
    let value;
    switch(quad) {
        case 0: {
            for(let i=0;i<=spos[0];++i) {
                for(let j=0;j<=spos[1];++j) {
                    _.set(division, [i, j], map[i][j])
                }
            }
            let allkeys = fix(division);
            let nspos = [spos[0]-1, spos[1]-1];
            _.set(division, nspos, '@');
            value = (solvePart(division, nspos, allkeys));
            break;
        }
        case 1: {
            for(let i=0;i<=spos[0];++i) {
                for(let j=spos[1];j<map[i].length;++j) {
                    _.set(division, [i, j], map[i][j])
                }
            }
            let allkeys = fix(division);
            let nspos = [spos[0]-1, spos[1]+1];
            _.set(division, nspos, '@');
            value = (solvePart(division, nspos, allkeys));
            break;
        }
        case 2: {
            for(let i=spos[0];i<map.length;++i) {
                for(let j=0;j<=spos[1];++j) {
                    _.set(division, [i, j], map[i][j])
                }
            }
            let allkeys = fix(division);
            let nspos = [spos[0]+1, spos[1]-1];
            _.set(division, nspos, '@');
            value = (solvePart(division, nspos, allkeys));
            break;
        }
        case 3: {
            for(let i=spos[0];i<map.length;++i) {
                for(let j=spos[1];j<map[i].length;++j) {
                    _.set(division, [i, j], map[i][j])
                }
            }
            let allkeys = fix(division);
            let nspos = [spos[0]+1, spos[1]+1];
            _.set(division, nspos, '@');
            value = (solvePart(division, nspos, allkeys));
            break;
        }
    }
    //console.log(quad, value)
    sum += value;
}
console.log('part2', sum)
