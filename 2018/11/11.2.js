//11   00:13:06   447      0   00:46:34   841      0
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

/*var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));

contents.forEach(line => {
    console.log(line);
})*/

var input = 3999;

function power(s,x,y) {
    if (x<1||x>300) {
        return -Infinity;
    }
    if (y<1||y>300) {
        return -Infinity;
    }
    let rid = x+10;
    let ps = rid*y;
    ps += s;
    ps *= rid;
    let hd = Math.floor(ps/100)%10;
    hd -= 5;
    return hd;
}

let maxx = 0;
let ress = "";
var sgrid = [];
var put = (x,y,v) => sgrid[x*300+y] = v;
var get = (x,y) => sgrid[x*300+y];
function comp(s,x,y) {
    let ch = get(x,y);
    if (ch!==undefined) return ch;
    if (!isFinite(power(s,x,y))) {
        put(x,y,0);
        return 0;
    }
    else {
        let c = power(s,x,y);
        let r1 = comp(s,x-1,y);
        let r2 = comp(s,x,y-1);
        let r3 = comp(s,x-1,y-1);
        let sum = r1+r2-r3+c;
        put(x,y,sum);
        return sum;
    }
}
for(let x=1;x<=300;++x) {
    for(let y=1;y<=300;++y) {
        comp(input,x,y);
    }
}

function s2(x,y,si) {
    let x1 = x+si;
    let y1 = y+si;
    let g1 = get(x1, y);
    let g2 = get(x, y1);
    let g3 = get(x, y);
    let g4 = get(x1, y1);
    let sum = g4-g1-g2+g3;
    return sum;
}

for(let x=1;x<=300;++x) {
    for(let y=1;y<=300;++y) {
        for(let si = 1;si<=300;++si) {
            if (x+si>300||y+si>300) break;
            let sum = s2(x-1,y-1,si);
            if (sum > maxx) {
                maxx = sum;
                ress = `${x},${y},${si}`
            }
        }
    }
}
console.log(input,maxx,ress);
