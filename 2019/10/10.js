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

let map = contents.map(line => {
    return line.split('')
});
map.forEach(line => {
    console.log(line);
})
var gcd = function(a, b) {
    if (!b) {
      return a;
    }
  
    return gcd(b, a % b);
  }
let total = 0;
let mini = Infinity;
let mind = [];
for(let ay = 0;ay<map.length;++ay) {
    for(let ax=0;ax<map[ay].length;++ax) {
        if (map[ay][ax]!=='#') continue;
        ++total;
        let fracs = []
        let ud = [];
        let ld = [];
        let hmu = new HM();
        let hmd = new HM();
        let hidden = 0;
        let iy;
        for(iy = 0;iy<ay;++iy) {
            for(let ix = 0;ix<map[iy].length;++ix) {
                if (map[iy][ix]!=='#') continue;
                let numr = ay-iy;
                let dnmr = Math.abs(ix-ax);
                let at = Math.atan2(iy-ay, ix-ax);
                fracs.push(at)
                let sgn = ix>ax;
                let gc = gcd(numr,dnmr);
                numr /= gc;
                dnmr /= gc;
                if (!sgn&&numr) numr = -numr;
                let dir = [numr,dnmr];
                //console.log(dir, gc, ix, iy, at)
                ud.push(dir);
                if (hmu.has(dir)) {
                    hidden += 1;
                    hmu.set(dir, hmu.get(dir)+1)
                } else {
                    hmu.set(dir, 1)
                }
            }
        }
        for(iy;iy<map.length;++iy) {
            for(let ix = 0;ix<map[iy].length;++ix) {
                if (map[iy][ix]!=='#') continue;
                if (ix===ax&&iy===ay) continue;
                let numr = iy-ay;
                let dnmr = Math.abs(ix-ax);
                let at = Math.atan2(iy-ay, ix-ax);
                fracs.push(at)
                let sgn = ix>ax;
                let gc = gcd(numr,dnmr);
                numr /= gc;
                dnmr /= gc;
                if (!sgn) {
                    if (numr)
                        numr = -numr;
                    else 
                        dnmr = -dnmr;
                }
                let dir = [numr,dnmr];
                //console.log(dir, gc, iy-ay, ix-ax, at)
                ld.push(dir);
                if (hmd.has(dir)) {
                    hidden += 1;
                    hmd.set(dir, hmd.get(dir)+1)
                } else {
                    hmd.set(dir, 1)
                }
            }
        }
        //fracs.sort((a,b)=>a-b)
        //console.log(fracs.length)
        //fracs = _.uniq(fracs)
        //console.log(fracs)
        //console.log(fracs.length)
        //console.log(hmu, hmd)
        //console.log(ud)
        //console.log(ld)
        if (hidden < mini) {
            mind = [ax,ay];
            mini = hidden;
        }
        //console.log(hidden, ax, ay);
    }
}
console.log(total-mini-1, mind);