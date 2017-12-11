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

function dist(row) {
    let sx = 0;
    let sy = 0;
    console.log(row);
    row.forEach(val => {
        [sx,sy] = mov(val, sx,sy);
    })
    console.log(`${sx} ${sy}`);
    bfs(sx,sy);
}

function mov(dir, sx, sy){
    switch(dir) {
        case 'n': sy-=2; break;
        case 'ne': sx+=1; sy-=1; break;
        case 'se': sx+=1; sy+=1; break;
        case 's': sy+=2; break;
        case 'sw': sx-=1; sy+=1; break;
        case 'nw': sx-=1; sy-=1; break;
    }
    return [sx,sy];
}

let dirs = ['n','ne','se','s','sw','nw'];

function bfs(x,y) {
    let hm = new HM();
    let closed = new HM();
    let open = new HM();
    hm.set([0,0], 0);
    open.set([0,0], 0);
    let mval = 0;
    while(!hm.has([x,y])) {
        open.keys().forEach(key => {
            if (closed.has(key)) {
                return;
            }
            let val = hm.get(key);
            dirs.forEach(dir => {
                let nk = mov(dir, key[0], key[1]);
                if (!hm.has(nk)||hm.get(nk)>val) {
                    hm.set(nk, val+1);
                    open.set(nk, val+1);
                }
            })
            if (val>mval) mval = val;
            closed.set(key, true);
            open.remove(key);
        })
        if (mval%100===0) {
            console.log(closed.size());
            console.log(open.size());
            console.log(mval);
        }
    }
    //console.log(hm);
    console.log(hm.get([x,y]))
}

contents.forEach(line => {
    dist(line);
})
