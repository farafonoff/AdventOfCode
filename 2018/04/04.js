//   4   00:38:06   685      0   00:42:26   596      0
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
var timestamp = /\[(\d+)-(\d+)-(\d+) (\d+):(\d+)\] (.*)/
var guardId = /Guard #(\d+) begins shift/
var asleep = /falls asleep/
var wup = /wakes up/


var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
var dates = [];
contents.forEach(line => {
    let [year,month,day,hour,minute,data] = timestamp.exec(line).slice(1);
    let date = new Date(Number(year), Number(month), Number(day), Number(hour), Number(minute), 0,0 );
    dates.push([date, [year,month,day,hour,Number(minute),data]]);
})
dates.sort((a,b)=>a[0].valueOf()-b[0].valueOf())
dates = dates.map(d=>d[1])
guardians = {}
gId = -1;
var gobject;
dates.forEach(line => {
    let str = line[5];
    //console.log(line);
    let gi = guardId.exec(str);
    if (gi) {
        gId = Number(gi[1]);
        if (!guardians[gId]) {
            guardians[gId] = [0,0,new Array(60).fill(0)];
        }
        gobject = guardians[gId];
        gobject[0] = 0;
    }
    if (asleep.exec(str)) {
        gobject[0] = Number(line[4]);
    }
    if (wup.exec(str)) {
        let m0 = gobject[0];
        let m1 = line[4];
        for(let i=m0;i<m1;++i) {
            gobject[2][i]+=1;
        }
        gobject[1]+=m1-m0;
    }
    //console.log(gId, gobject);
}
)
let res1 = Object.keys(guardians)[0];
Object.keys(guardians).forEach(id => {
    if (guardians[res1][1]<guardians[id][1]) {
        res1 = id;
    }
})
let mm = Math.max.apply(null,guardians[res1][2]);
console.log(res1*guardians[res1][2].indexOf(mm));

function rval(guard) {
    let mm = Math.max.apply(null,guard[2]);
    return mm;
}
let res2 = Object.keys(guardians)[0];
Object.keys(guardians).forEach(id => {
    if (rval(guardians[res1])<rval(guardians[id])) {
        res2 = id;
    }
})

console.log(res2*guardians[res2][2].indexOf(rval(guardians[res2])));
