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
let spos = [];
let ac = 'a'.charCodeAt(0);
let zc = 'z'.charCodeAt(0);
let AC = 'A'.charCodeAt(0);
let ZC = 'Z'.charCodeAt(0);
let isLC = (char) => char.charCodeAt(0)<=zc && char.charCodeAt(0)>=ac; 
let isUC = (char) => char.charCodeAt(0)<=ZC && char.charCodeAt(0)>=AC;
let toLC = (char) => String.fromCharCode(char.charCodeAt(0)-AC+ac);
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
//console.log(spos)
let posExpand = (pos) => {
    let res = [
      [pos[0]+1,pos[1]],
      [pos[0]-1,pos[1]],
      [pos[0],pos[1]+1],
      [pos[0],pos[1]-1]
    ]
    return res;
}
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
    while(open.length) {
        let cstate = open.dequeue();
        let samecell = _.get(c2, [cstate.pos[0],cstate.pos[1]], {})
        try {
          _.forOwn(samecell, (state, keys) => {
            let isSubset = true;
            if (state.jkeys.length < cstate.jkeys.length) return;
            _.forOwn(cstate.mkeys, (value, key) => {
              if (!state.mkeys[key]) {
                isSubset = false;
              }
            });
            //console.log(state.mkeys, cstate.mkeys, isSubset);
            if (isSubset) {
              //console.log(state.mkeys, cstate.mkeys, isSubset);
              throw "subset";
            }
          });
        } catch (found) {
          continue;
        }
        //console.log(cstate)
        let neigh = posExpand(cstate.pos).filter(npos => canStep(npos, cstate.mkeys))
        //console.log(neigh)
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
            if (!_.get(c2, [ne[0],ne[1],ns.jkeys], false)) {
                open.queue(ns)
                //open.push(ns);
            }
        });
        /*++iter;
        if (iter % 1000 === 0) {
          console.log(Object.keys(samecell).length);
          console.log(iter)
          console.log(open.length)
          console.log(cstate);
        }*/
        //console.log(closed.count(), cstate)
        //console.log(cstate)
        _.set(c2, [cstate.pos[0],cstate.pos[1],cstate.jkeys], cstate)
        //console.log(c2)
        //closed.set([ cstate.pos, cstate.keys.join('') ], true)
        if (cstate.jkeys.length === allkeys.length) {
            //console.log(closed.count())
            //console.log(open.length)
            console.log(cstate.steps);
            break;
            console.log(cstate)
        };
    }
    return;
    let msteps = Infinity;
    //console.log(closed.keys().length)
    //console.log(closed.keys())
    closed.values().forEach(value => {
        //console.log(value)
        if (value.keys.length === allkeys.length) {
            msteps = Math.min(msteps, value.steps)
        }
    })
    return msteps;
}
//console.log(allkeys)
console.log(accessibleFrom(spos, []))
//console.log(allkeys)
/*let djk = () => {
    let open = new PQ({ comparator: (k1, k2) => {
        return k1.dist - k2.dist;
    }});
    let weights = {}
    allkeys.forEach(key => weights[key] = Infinity)
    let initial = accessibleFrom(spos, {})
    _.forOwn(initial, (value, key) => {
        weights[key] = value[0];
        open.queue({dist: weights[key], key, pos: value[1], keys: {[key]: true}})
        
    })
    while(open.length>0) {
        let current = open.dequeue();

    }
}

djk();*/