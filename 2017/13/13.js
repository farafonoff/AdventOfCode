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
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/: /).map(Number));

function severity(lines, delay, cc) {
    //console.log(delay);
    let ans = 0;
    try {
        lines.forEach(line => {
            let t = (line[1]-1)*2;
            let caught = (line[0]+delay)%t===0;
            //console.log(line);
            //console.log(caught);
            ans += (caught)?line[0]*line[1]:0;
            //console.log(cc);
            if (cc&&caught) {
                throw 1000;
            }
        })    
    } catch (ex) {
        return ex;
    }
    return ans;
}

let delay = 0;
console.log(severity(contents, 0));
let sev = severity(contents, delay);
while(sev>0) {
    ++delay;
    sev = severity(contents, delay, true);
}
console.log(delay);