// 18   00:19:47   295      0   00:30:20   212      0
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
var map = [];
contents.forEach(line => {
    map.push(line.split(''))
})
let around = [[-1, -1], [-1, 0], [-1, 1],[1, -1], [1, 0], [1, 1], [0, -1], [0, 1]];
let sum = (v1, v2) => { return [v1[0]+v2[0], v1[1] + v2[1]] }
let cc = (map, v, t) => {
    let r = 0;
    around.forEach(v2 => {
        [xa,ya]=sum(v, v2);
        if (map[ya]&&map[ya][xa]===t) {
            r+=1
        }
    })
    return r;
}
cc(map, [8,0],'#')
function calc() {
    let awoods = 0;
    let al = 0;
    map.forEach((row, y) => {
        row.forEach((val, x) => {
            switch (val) {
                case '|': {
                    awoods++;
                    break;
                }
                case '#': {
                    al++;
                    break;
                }
            }
        });
    });
    //console.log(awoods, al, awoods * al);
    return awoods*al;
}
function step() {
    let result = []
    map.forEach((row,y) => {
        let fr = [];
        result.push(fr);
        row.forEach((val, x) => {
            switch (val) {
                case '.': {
                    if (cc(map, [x, y], '|') >= 3) {
                        fr.push('|')
                    } else {
                        fr.push('.')
                    }
                    break;
                }
                case '|': {
                    if (cc(map, [x, y], '#') >= 3) {
                        fr.push('#')
                    } else {
                        fr.push('|')
                    }
                    break;
                }
                case '#': {
                    let ll = cc(map, [x, y], '#');
                    let lt = cc(map, [x, y], '|');
                    if (ll>=1&&lt>=1) {
                        fr.push('#')
                    } else {
                        fr.push('.')
                    }
                    break;
                }
           }
        });
    });
    return result;
}

let period = []

for(let i=1;i<1200;++i) {
    map = step();
    if (i===10) {
        console.log('Part 1: ', calc())
    }
    period[i]=calc()
}
//console.log(period.slice(900,956))
let peri;
let plen = period.length-1;
for(let ch = 1;ch<100;++ch) {

    if (period[plen-ch] === period[plen] && period[plen-ch] === period[plen-ch-ch] && period[plen-ch] === period[plen-ch-ch-ch]) {
        console.log('Period: ',ch);
        peri = ch;
        break;
    }
}
let q2 = (1000000000-plen)%peri;
//console.log(period);
console.log('Part 2: ',period[plen-peri*3+q2]);