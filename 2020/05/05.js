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
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content

function frange(code, range) {
    let res = 0;
    let radd = range / 2
    code.forEach(cd => {
        if (cd) {
            res += radd
        }
        radd /= 2
    })
    return res
}

function bpass(code) {
    const rcode = code.slice(0, 7).split('').map(ch => ch==='F'?0:1);
    const scode = code.slice(7).split('').map(ch => ch==='L'?0:1)
    //console.log(rcode, scode)
    const rid = frange(rcode, 128)
    const sid = frange(scode, 8)
    //console.log(rid, sid)
    return rid * 8 + sid
}
/*
const t1 = "FBFBBFFRLR"
console.log(bpass(t1))
console.log(bpass("BFFFBBFRRR"))
*/
console.log(Math.max.apply(null, contents.map(line => {
    return bpass(line)    
})))

const planemap = []
for(let i=0;i<128;++i) {
    planemap[i] = []
    for(let j=0;j<8;++j) {
        planemap[i][j] = '_'
    }
}
contents.forEach(ll => {
    const ssid = bpass(ll)
    const [rid, sid] = [Math.floor(ssid/8), ssid%8]
    _.set(planemap, [rid, sid], '#')
})
planemap.forEach((row, idx) => {
    const frees = row.indexOf('_')
    if (frees !== -1) {
        if (_.get(planemap, [idx-1,frees]) === '#' && _.get(planemap, [idx+1,frees]) === '#') {
            console.log(idx * 8 + frees)
        }
    }
})
/*
planemap.forEach((row, idx) => {
    console.log(idx, row.join(''))
})
*/