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
/*map.forEach(line => {
    console.log(line);
})*/
var gcd = function (a, b) {
    if (!b) {
        return a;
    }

    return gcd(b, a % b);
}
let dst20 = (a) => {
    return a[0] * a[0] + a[1] * a[1]
}

function solve1() {
    let total = 0;
    let mini = Infinity;
    let mind = [];
    for (let ay = 0; ay < map.length; ++ay) {
        for (let ax = 0; ax < map[ay].length; ++ax) {
            if (map[ay][ax] !== '#') continue;
            ++total;
            let ud = [];
            let ld = [];
            let hmu = new HM();
            let hmd = new HM();
            let hidden = 0;
            let iy;
            for (iy = 0; iy < ay; ++iy) {
                for (let ix = 0; ix < map[iy].length; ++ix) {
                    if (map[iy][ix] !== '#') continue;
                    let numr = ay - iy;
                    let dnmr = Math.abs(ix - ax);
                    let sgn = ix > ax;
                    let gc = gcd(numr, dnmr);
                    numr /= gc;
                    dnmr /= gc;
                    if (!sgn) numr = -numr;
                    let dir = [numr, dnmr];
                    ud.push(dir);
                    if (hmu.has(dir)) {
                        hidden += 1;
                    } else {
                        hmu.set(dir, 1)
                    }
                }
            }
            for (iy; iy < map.length; ++iy) {
                for (let ix = 0; ix < map[iy].length; ++ix) {
                    if (map[iy][ix] !== '#') continue;
                    if (ix === ax && iy === ay) continue;
                    let numr = iy - ay;
                    let dnmr = Math.abs(ix - ax);
                    let sgn = ix > ax;
                    let gc = gcd(numr, dnmr);
                    numr /= gc;
                    dnmr /= gc;
                    if (!sgn) {
                        if (numr)
                            numr = -numr;
                        else 
                            dnmr = -dnmr;
                    }
                    let dir = [numr, dnmr];
                    ld.push(dir);
                    if (hmd.has(dir)) {
                        hidden += 1;
                    } else {
                        hmd.set(dir, 1)
                    }
                }
            }
            //console.log(ud)
            //console.log(ld)
            if (hidden < mini) {
                mind = [ay, ax];
                mini = hidden;
            }
            //console.log(hidden, ax, ay);
        }
    }
    console.log(total)
    console.log(total-mini-1)
    return mind;
}
let cc = solve1();
console.log(cc);
let counter = 0;
for (let i = 0; i < 1; ++i) {
    let ay = cc[0];
    let ax = cc[1];
    let ud = [];
    let ld = [];
    let iy;
    for (iy = 0; iy < ay; ++iy) {
        for (let ix = 0; ix < map[iy].length; ++ix) {
            if (map[iy][ix] !== '#') continue;
            ud.push([ay - iy, ix - ax]);
        }
    }
    ud.sort((c1, c2) => {
        let da = c1[1] / c1[0] - c2[1] / c2[0]
        if (Math.abs(da) > 0.000000000001) {
            return da;
        } else {
            let d1 = dst20(c1)
            let d2 = dst20(c2)
            return d1 - d2;
        }
    })

    for (iy; iy < map.length; ++iy) {
        for (let ix = 0; ix < map[iy].length; ++ix) {
            if (map[iy][ix] !== '#') continue;
            if (ix === ax && iy === ay) continue;
            ld.push([ay - iy, ix - ax]);
        }
    }
    ld.sort((c1, c2) => {
        let t1 = c1[1] / c1[0];
        let t2 = c2[1] / c2[0];
        let da = t1 - t2
        if (t1 !== t2 && !isNaN(da) && Math.abs(da) > 0.000000000001) {
            return da;
        } else {
            let d1 = dst20(c1)
            let d2 = dst20(c2)
            return d1 - d2;
        }
    })
    let vap = (fc) => {
        ++counter;
        if (counter === 200) {
            console.log(fc[1], fc[0])
        }
        map[fc[0]][fc[1]] = '*';
    }
    let qq = ud.filter(pp => pp[1] >= 0).filter((pp, i, ar) => {
        if (i === 0) return true;
        if (pp[1] / pp[0] - ar[i - 1][1] / ar[i - 1][0] < 0.00000000000001) {
            return false;
        }
        return true;
    })
    qq.forEach(up => {
        let fc = [ay - up[0], up[1] + ax];
        //console.log(up, up[1]/up[0], dst20(up), ax, ay)
        vap(fc);
    })
    qq = ld.filter((pp, i, ar) => {
        if (i === 0) return true;
        let t1 = pp[1] / pp[0];
        let t2 = ar[i - 1][1] / ar[i - 1][0];
        if (t1 === t2 || t1 - t2 < 0.00000000000001) {
            return false;
        }
        return true;
    });
    qq.forEach(up => {
        let fc = [ay - up[0], up[1] + ax];
        //console.log(up, up[1]/up[0], dst20(up), ax, ay)
        vap(fc);
    })
    qq = ud.filter(pp => pp[1] < 0).filter((pp, i, ar) => {
        if (i === 0) return true;
        if (pp[1] / pp[0] - ar[i - 1][1] / ar[i - 1][0] < 0.00000000000001) {
            return false;
        }
        return true;
    })
    qq.forEach(up => {
        let fc = [ay - up[0], up[1] + ax];
        //console.log(up, up[1]/up[0], dst20(up), ax, ay)
        vap(fc);
    })
    /*ud.forEach(pp => {
        if (pp[1]>=0) {
            ++counter;
            console.log(counter, pp[1]+ax, pp[1]+ay)
        }
    })*/
}
//console.log(total-mini, mind);
