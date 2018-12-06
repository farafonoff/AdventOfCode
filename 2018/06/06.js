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
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/, /).map(Number));
var size = 500;
var bs = -100;
/*var field = new Array(size*size);
field.tr = (x,y) => x*size+y;
field.put = (x,y,v) => this[this.tr(x,y)] = v;
field.get = (x,y) => this[this.tr(x,y)];*/
let areas = [];
function areaz(bs,size) {
    mhd = ([x,y],[x1,y1]) => {
        return Math.abs(x-x1)+Math.abs(y-y1);
    }
    var areas = [];
    for(let i=bs;i<size;++i) {
        for(let j=bs;j<size;++j) {
            var dm = contents.map((line,idx) => {
                return mhd(line, [i,j]);
            })
            var mdm = Math.min.apply(null, dm);
            var cdm = dm.filter(v => v===mdm);
            var closest = dm.indexOf(mdm);
            if (cdm.length===1) {
                areas[closest] = areas[closest]===undefined?1:areas[closest]+1;
                if (i==bs||j==bs||i==size-1||j==size-1) {
                    //onbound[closest] = 1;
                }
            }
        }
    }
    return areas;
}

var areas1 = areaz(bs,size);
console.log(areas1);
var areas2 = areaz(bs-10,size+10);
console.log(areas2);
let maxc = 0;
let maxv = 0;
for(let i=0;i<contents.length;++i) {
    var inbound = areas1[i]===areas2[i];
    if ((areas1[i]>maxv)&&inbound) {
        maxc = i;
        maxv = areas1[i];
    }
}
console.log(maxc,maxv);
