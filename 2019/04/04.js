//   4   00:07:08   799      0   00:15:23   728      0
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
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t-]/).map(Number));
let count = 0;
let count2 = 0;
contents.forEach(line => {
    for(let i=line[0];i<line[1];++i) {
        let s = String(i);
        let sa = s.split('');
        let double = false;
        let incr = true;
        let dd2 = [false];
        let dd2m = false;
        sa.forEach((di, idx) => {
            if (idx) {
                if (di < sa[idx-1]) {
                    incr = false;                    
                }
                if (di === sa[idx-1]) {
                    double = true;
                }
                dd2.push(di === sa[idx-1])
            }
        })
        dd2.push(false);
        dd2.forEach((v, idx) => {
            if(!dd2[idx-1]&&v&&!dd2[idx+1]) {
                dd2m = true;
            }
        })
        if (double&&incr) {
            //console.log(s);
            count +=1;
        }
        if (double&&incr&&dd2m) {
            //console.log(dd2);
            count2 +=1;
        }
    }
})

console.log(count, count2);