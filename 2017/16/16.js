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
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[,]/));

let letterz = "abcdefghijklmnop";
contents.forEach(line => {
    let len = 16;
    let arr = letterz.substring(0,len).split('');
    let reps = 1000000000;
    for (let lp = 0;lp<reps;++lp) {
    line.forEach(cmd => {
        let mo;
        if (mo=cmd.match(/^s(\d+)$/)) {
            let d = Number(mo[1]);
            arr = arr.slice(-d).concat(arr.slice(0,-d));
        } else
        if (mo=cmd.match(/^x(\d+)\/(\d+)$/)) {
            let d = Number(mo[1]);
            let d1 = Number(mo[2]);
            [arr[d],arr[d1]] = [arr[d1],arr[d]];
        } else
        if (mo=cmd.match(/^p([a-p])\/([a-p])$/)) {
            let d = mo[1];
            let d1 = mo[2];
            arr = arr.map(c => c===d1?d:(c===d?d1:c))
        }
    })
    if (lp===0) {
        console.log(`Part 1 ${arr.join('')}`);
    }
    if (arr.join('')===letterz) {
        reps = reps%(lp+1)+lp+1;
        console.log('period ', lp+1)
    }
    }
    console.log(`Part 2 ${arr.join('')}`);
})
