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

var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim());
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
const passports = []
let passport = {}
contents.push("");
contents.forEach(line => {
    if (line.length === 0) {
        passports.push(passport)
        passport = {}
    } else {
        line.split(' ').forEach(part => {
            const [fld, val] = part.split(':')
            passport[fld] = val;
        })
    }

})
const requireds = ['byr', 'iyr', 'eyr', 'hgt', 'hcl', 'ecl', 'pid']
const valid = passports.filter(pp => {
    const flds = Object.keys(pp);
    const missing = requireds.filter(rq => flds.indexOf(rq) === -1)
    return missing.length === 0
});
console.log(valid.length)
const between = (val, min, max) => val >= min && val <= max;

const valid2 = valid.filter(pp => {
    const byr = between(Number(pp.byr), 1920, 2002)
    const iyr = between(Number(pp.iyr), 2010, 2020)
    const eyr = between(Number(pp.eyr), 2020, 2030)
    let hgt = false
    const mm = pp.hgt.substring(pp.hgt.length-2)
    const hgtv = Number(pp.hgt.substring(0, pp.hgt.length-2))
    if (mm === 'in') {
        hgt = between(hgtv, 59, 76)
    }
    if (mm === 'cm') {
        hgt = between(hgtv, 150, 193)
    }
    //console.log(mm, hgtv)
    const hcl = !!pp.hcl.match(/^#[0-9a-f]{6}$/)
    const ecl = 'amb blu brn gry grn hzl oth'.split(' ').indexOf(pp.ecl) !== -1
    const pid = !!pp.pid.match(/^[0-9]{9}$/)
    // console.log(pp, byr, iyr, eyr, hgt, hcl, ecl, pid)
    return byr && iyr && eyr && hgt && hcl && ecl && pid;
})
console.log(valid2.length)
