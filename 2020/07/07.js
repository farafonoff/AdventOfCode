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
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\w+ \w+) bags contain (.*)\./)); // [orig, g1, g2 ...] = content
contents = contents.map(parsed => {
    const terminal = parsed[2].startsWith('no');
    let bagz = []
    if (!terminal) {
        bagz = parsed[2].split(', ').map(bag => {
            return bag.split(' ');
        }).map(bag => {
            let [count, c1, c2] = bag
            return { count: Number(count), color: `${c1} ${c2}`}
        })
    }
    return {
        product: parsed[1],
        content: bagz
    }
})
/*contents.forEach(line => {
    console.log(line);
})*/
const mybag = 'shiny gold'

function checkContent(rule) {
    let canhold = false;
    if (rule.product === mybag) {
        return true
    }
    rule.content.forEach(bagd => {
        const rule = contents.find(r => r.product === bagd.color);
        const ch = checkContent(rule)
        canhold = canhold || ch
    })
    return canhold
}
let res = 0
contents.forEach(rr => {
    let found = checkContent(rr)
    if (found) {
        // console.log(rr)
        res++
    }
})
console.log(res-1)

function countBags(rule) {
    let result = 1;
    rule.content.forEach(rd => {
        let nest = contents.find(r => r.product === rd.color);
        result += rd.count * countBags(nest)
    })
    return result
}

let startRule = contents.find(pr => pr.product === mybag)
console.log(countBags(startRule) - 1)
