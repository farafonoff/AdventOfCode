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
let isLC = (char) => /[a-z]/.test(char);
let isUC = (char) => /[A-Z]/.test(char);
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
console.log(spos)
let posExpand = (pos) => {
    let ss = [-1, 1]
    let res = ss.map(s => [pos[0]+s, pos[1]])
    return res.concat(ss.map(s => [pos[0], pos[1]+s]))
}
let charAt = (pos) => {
    return map[pos[0]][pos[1]]
}
let canStep = (pos, keys) => {
    if (charAt(pos) === '.') return true;
    if (charAt(pos) === '#') return false;
    if (charAt(pos) === '@') return true;
    if (isLC(charAt(pos))) return true;
    if (isUC(charAt(pos))) {
        let result;
        if (keys[(charAt(pos).toLowerCase())]) result = true;
        else result = false;
        //console.log(pos, charAt(pos), keys, result)
        return result;
    }
    console.log('unknown', charAt(pos))
}

let accessibleFrom = (pos, keys) => {
    let ist = _.cloneDeep({pos, keys, steps: 0, mkeys: {}});
    let open = new PQ({ comparator: (s1, s2) => {
        if (s1.steps!==s2.steps) {
            return s1.steps - s2.steps;
        }
        if (s1.keys.length !== s2.keys.length) {
            return s2.keys.length - s1.keys.length;
        }
    }})
    open.queue(ist);
    let closed = new HM();
    while(open.length) {
        let cstate = open.dequeue();
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
                    ns.keys.push(nc);
                    ns.mkeys[nc] = true;
                }
            }
            //ns.keys.sort();
            let closing = [ne, ns.keys ]
            if (!closed.has(closing)) {
                open.queue(ns)
                //open.push(ns);
            }
        })
        //console.log(closed.count(), cstate)
        //console.log(cstate)
        closed.set([ cstate.pos, cstate.keys ], cstate)
        if (cstate.keys.length === allkeys.length) {
            break;
            console.log(cstate)
        };
    }
    let msteps = Infinity;
    console.log(closed.keys().length)
    //console.log(closed.keys())
    closed.values().forEach(value => {
        //console.log(value)
        if (value.keys.length === allkeys.length) {
            msteps = Math.min(msteps, value.steps)
        }
    })
    return msteps;
}
console.log(allkeys)
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