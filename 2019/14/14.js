// 14   00:59:14   478      0   01:07:01   312      0
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
let reactions = []
contents.forEach(line => {
    let parts = line.split(' => ')
    let rp = parts[1].split(' ');
    let reac = {}
    reac.rp = {count: Number(rp[0]), chem: rp[1]}
    reac.lp = [];
    let src = parts[0].split(', ')
    src.forEach(lp => {
        let rp = lp.split(' ');
        let pp = {count: Number(rp[0]), chem: rp[1]};
        reac.lp.push(pp);
    })
    reactions.push(reac);
})
let depot = {
    'ORE': Infinity
}

let totals = {

}

let buildChem = (count, chemId) => {
    if (chemId === 'ORE') {
        depot.ORE -= count;
        if (depot.ORE < 0) throw 'out';
        return count;
    }
    if (depot[chemId]) {
        let am = Math.min(depot[chemId], count);
        count -= am;
        depot[chemId] -= am;
    }
    if (count === 0) return 0;
    let reaction = reactions.find(re => re.rp.chem === chemId);
    let prodCount = Math.max(count, reaction.rp.count);
    let multiplier = Math.ceil(prodCount/reaction.rp.count);
    prodCount = reaction.rp.count * multiplier;
    let result = 0;
    reaction.lp.forEach(src => {
        result += buildChem(src.count*multiplier, src.chem);
    })
    let remain = prodCount - count;
    if (remain > 0) {
        depot[chemId] = _.get(depot, chemId, 0) + remain;
    }
    return result;
}

console.log('answer1 ',buildChem(1,'FUEL'))
let trillion = 1000000000000;
depot = { ORE: trillion }
let count = 0;
let step = Number.MAX_SAFE_INTEGER;
try {
    while (true) {
        let ostate = {...depot};
        try {
            buildChem(step, 'FUEL');
            count += step;
            console.log(count, step);
        } catch (e) {
            if (step === 1) throw 'done'
            step = Math.round(step/2);
            depot = ostate;
        }
    }
}
catch (e) {
    console.log('answer2 ', count)
}
//console.log(JSON.stringify(reactions, null, 2));