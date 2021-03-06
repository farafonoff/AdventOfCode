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
console.log(power(57,122,79))
console.log(power(39,217,196))
console.log(power(71,101,153))  
let maxx = 0;
let ress = "";
for(let x=1;x<=300;++x) {
    for(let y=1;y<=300;++y) {
        let tp = 0;
        for(let t = 0;t<3;++t) {
            for(let v = 0;v<3;++v) {
                tp+=power(input,x+t, y+v);
            }
        }
        if (tp > maxx) {
            maxx = tp;
            ress = `${x},${y}`
        }
    }
}

console.log(maxx,ress);
