//  12   00:17:55   374      0   00:38:58   117      0
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
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t<>xyz=,]+/).map(Number).slice(1,4));

let system = []
contents.forEach(line => {
    system.push({
        pos: line,
        vel: [0,0,0]
    })
})
let vsum = (v1,v2) => {
    return v1.map((c,i) => c+v2[i]);
}
let step = (system) => {
    let result = system.map(obj => {
        let velpatch = system.reduce((acc, other) => {
            obj.pos.forEach((c, i) => {
                if (c < other.pos[i]) acc[i]++;
                if (c > other.pos[i]) acc[i]--;
            });
            return acc;
        }, [0,0,0]);
        let newvel = vsum(obj.vel, velpatch);
        let newpos = vsum(obj.pos, newvel);
        return {
            pos: newpos,
            vel: newvel
        }
    });
    return result;
}
let epart = (system, part) => {
    return system.map((obj) => {
        let acc = 0;
        obj[part].forEach(pp => acc+=Math.abs(pp))
        return acc;
    })
}
let energy = (system) => {
    let pots = epart(system, 'pos');
    let kins = epart(system, 'vel');
    return pots.reduce((pv, cv, ci) => pv+cv*kins[ci], 0)
}

console.log(system);
let basesystem = system;
let baseenergy = energy(system);
for(let i=0;i<1000;++i) {
    system = step(system)
    let newenergy = energy(system);
    if (baseenergy === newenergy && _.isEqual(system, basesystem)) {
        console.log('p2', i + 1)
        break;
    }
}
console.log(energy(system))

//part 2
let calcPeriod = (osystem, component) => {
    let system = osystem.map(obj => ({ pos: [obj.pos[component]], vel: [obj.vel[component]] }))
    let basesystem = system;
    let baseenergy = energy(system);
    for (let i = 0; i < Infinity; ++i) {
        system = step(system)
        let newenergy = energy(system);
        if (baseenergy === newenergy && _.isEqual(system, basesystem)) {
            return i+1;
        }
        if (i % 1000000 === 1 && i > 1000000) {
            console.log('!', i)
        }
    }
}
var gcd = function (a, b) {
    if (!b) {
        return a;
    }

    return gcd(b, a % b);
}
let periods = [0,1,2].map(pp => calcPeriod(system, pp))
console.log('periods', periods)
let gcd1 = gcd(periods[0], periods[1])
let tv = periods[0]/gcd1*periods[1];
let gcd2 = gcd(tv, periods[2]);
tv/=gcd2;
console.log(periods[2] * tv)