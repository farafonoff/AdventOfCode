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

/*let depth = 8787
let target = [10,725,0]*/
let depth = 8787
let target = [10,725,0]
let targetp = target.slice(0,2);
let zero = [0,0];
let hm = new HM();

let up = (point) => [point[0], point[1]-1, point[2]]
let rt = (point) => [point[0]-1, point[1], point[2]]
let dw = (point) => [point[0], point[1]+1, point[2]]
let lt = (point) => [point[0]+1, point[1], point[2]]
let dirs = [up, rt, dw, lt]
function calcIndex(point) {
    let arg = [point[0], point[1]];
    if (hm.has(arg)) return hm.get(arg);
    let result;
    if (_.isEqual(arg, targetp)) {
        result = 0;
    } else 
    if (_.isEqual(arg, zero)) {
        result = 0;
    } else
    if (arg[0] === 0) {
        result = arg[1] * 48271;
    } else
    if (arg[1] === 0) {
        result = arg[0] * 16807;
    } else {
        result = calcIndex(up(arg)) * calcIndex(rt(arg));
    }
    result = (result + depth) % 20183;
    hm.set(arg, result)
    return result;
}
//console.log(calcIndex(target))
let ans1 = 0;
for(let i=0;i<=target[0];++i) {
    for(let j=0;j<=target[1];++j) {
        ans1+=calcIndex([i,j])%3;
    }
}
console.log(ans1)

let can = (state, tool)  => {
    let type = calcIndex(state)%3;
    switch(type) {
        case 0: {
            if (tool === 2) return false;
            break;
        }
        case 1: {
            if (tool === 0) return false;
            break;
        }
        case 2: {
            if (tool === 1) return false;
            break;
        }
    }
    return true;    
}

/*let edge = (state, nstate) => {
    if (nstate[0]<0 || nstate[1]<0) return Infinity;
    if (nstate[0]>8*target[1] || nstate[1]>8*target[1]) return Infinity;
    let valid = true;
    if (valid) {
        return state[2] === nstate[2]?1:8;
    } else {
        return Infinity;
    }
}*/
// torch 0
// climb 1
// neither 2
let dist = new HM();
//let weight = (state) => dist.get(state) + Math.abs(target[0]-state[0]) + Math.abs(target[1]-state[1])
let open = new PQ({comparator: (s1, s2) => s1[0]-s2[0]});
open.queue([0, [0,0,0]])

for (let i = 0; i < 100000000&&open.length; ++i) {
    let [ctime, state] = open.dequeue();
    if (dist.has(state)&&dist.get(state)<=ctime) {
        continue;
    }
    dist.set(state, ctime);
    //console.log(ctime, state)
    if (_.isEqual(state,target)) {
        console.log(state, ctime)
        break;
    }
    if (i%100000 === 0) {
        console.log(i, state, ctime)
    }
    //console.log('from', state, ctime)
    for (let ntool = 0; ntool < 3; ++ntool) {
        if (state[2]!==ntool && can(state, ntool)) {
            let nstate = [...state];
            nstate[2] = ntool;
            open.queue([ctime+7, nstate])
        }
    }
    dirs.forEach(dir => {
        let nstate = dir(state);
        if (nstate[0]>=0&&nstate[1]>=0) {
            if (can(nstate, state[2])) {
                open.queue([ctime+1, nstate])
            }
        }
    })
}
//console.log(open)
//console.log(dist)
console.log(dist.get(target))