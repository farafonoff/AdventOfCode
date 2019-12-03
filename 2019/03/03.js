//   3   00:14:29   283      0   00:18:57   222      0
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

//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t,]/))

let pointz = contents.map(line => {
    let ppz = [];
    let pos = [0,0];
    line.forEach(segm => {
        let dir = segm.charAt(0);
        let len = Number(segm.substr(1));
        let vec;
        switch (dir) {
            case 'U': vec = [0, 1];break;
            case 'D': vec = [0, -1];break;
            case 'L': vec = [-1, 0];break;
            case 'R': vec = [1, 0];break;
        }
        for(let i=0;i<len;++i) {
            ppz.push([...pos]);
            pos = pos.map((p,pc) => p+vec[pc]);
        }
    })
    return ppz;
})
let hm = new HM();
let isecs = [];
pointz[0].forEach((point, idx) => {
    hm.set(point, idx);
})
pointz[1].forEach((point, idx) => {
    if (hm.has(point)) {
        isecs.push([...point, idx + hm.get(point)]);
    }
})
//console.log(isecs);
let cp = Infinity;
let cp1 = Infinity;
isecs.forEach(pp => {
    let dd = Math.abs(pp[0])+Math.abs(pp[1]);
    if (dd > 0 && dd < cp) {
        cp = dd;
    }
    if (pp[2] > 0 && pp[2]< cp1) {
        cp1 = pp[2];
    }
})
console.log(cp, cp1);