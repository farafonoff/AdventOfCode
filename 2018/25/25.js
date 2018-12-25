// 25   00:22:10   281      0   00:22:31   225      0
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
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[, ]/).map(Number));
/*contents.forEach(line => {
    console.log(line);
})*/
let trh = 3;
let mhd = (a1,a2) => {
    return a1.reduce((s,e,idx) => s+Math.abs(e-a2[idx]), 0)
}
let graph = contents.map(v1 => {
    return contents.map(v2 => {
        //console.log(v1,v2,mhd(v))
        if (mhd(v1,v2)<=trh) {
            return 1;
        } else {
            return 0;
        }
    })
})
//console.log(graph)
let components = contents.map(() => -1)
function compy(sidx, mrk) {
    components.forEach((cmp, idx) => {
        if (sidx !== idx) {
            if (cmp===-1 && graph[sidx][idx] === 1) {
                components[idx] = mrk;
                compy(idx,mrk)
            }
        }
    })
}

let sidx;
while((sidx = components.indexOf(-1))!==-1) {
    components[sidx] = sidx
    compy(sidx,sidx)
    //console.log(components)
}

let distinct = _.uniq(components);
console.log(distinct.length)
