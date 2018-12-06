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
var size = 400;
var bs = -1;
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
        var str = "";
        for(let j=bs;j<size;++j) {
            var dm = contents.map((line,idx) => {
                return mhd(line, [j,i]);
            })
            var mdm = Math.min.apply(null, dm);
            var cdm = dm.filter(v => v===mdm);
            var closest = dm.indexOf(mdm);
            if (cdm.length===1) {
                areas[closest] = areas[closest]===undefined?1:areas[closest]+1;
                if (i==bs||j==bs||i==size-1||j==size-1) {
                    //onbound[closest] = 1;
                }
                str+=(closest<9?closest:
                        closest<26?String.fromCharCode("a".charCodeAt(0)+closest):'*');
            } else {
                str+='.';
            }
        }
        //console.log(str);
    }
    return areas;
}

function solve2(bs,size,limit) {
    mhd = ([x,y],[x1,y1]) => {
        return Math.abs(x-x1)+Math.abs(y-y1);
    }
    var areas = [];
    var result = 0;
    for(let i=bs;i<size;++i) {
        var str = "";
        for(let j=bs;j<size;++j) {
            var dm = contents.map((line,idx) => {
                return mhd(line, [j,i]);
            })
            var sum = dm.reduce((s,v)=>s+v, 0);
            if (sum<limit) {
                str+='*';
                result+=1;
            } else {
                str+='.';
            }
        }
        //console.log(str);
    }
    return result;
}


var areas1 = areaz(bs,size);
var areas2 = areaz(bs-10,size+10);
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
console.log(solve2(-500,1000,10000))
