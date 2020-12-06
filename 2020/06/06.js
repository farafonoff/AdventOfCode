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

var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim())
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let cgroup = {}
let allgroups = []
contents.push("")
contents.forEach(line => {
    if (line.length>0) {
        const lar = line.split('')
        lar.forEach(lch => {
            cgroup[lch] = true
        })
    } else {
        allgroups.push(cgroup)
        cgroup = {}
    }
})
let ans = 0;
allgroups.forEach(grp => {
    ans += Object.keys(grp).length
})
console.log(ans)

allgroups = []
cgroup = {}
ccgroup = []
ans = 0
contents.forEach(line => {
    if (line.length>0) {
        const lar = line.split('')
        ccgroup.push(lar)
    } else {
        for(let ch="a".charCodeAt(0);ch<="z".charCodeAt(0);++ch) {
            let allyes = true;
            ccgroup.forEach(grp => {
                if (grp.indexOf(String.fromCharCode(ch))===-1) {
                    allyes = false
                }
            })
            if (allyes) {
                cgroup[String.fromCharCode(ch)] = true
            }
        }
        allgroups.push(cgroup)
        cgroup = {}
        ccgroup = []
    }
})
allgroups.forEach(grp => {
    ans += Object.keys(grp).length
})
console.log(ans)
