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
let regexOuter = /(\d+) units each with (\d+) hit points (?:\((.*)\))? with an attack that does (\d+) (.*) damage at initiative (\d+)/
let regexImmune = /immune to (.+)/
let regexWeak = /weak to (.+)/
let immune = []
let infect = []
let armys = [immune,infect]
let state = 0;
let armyss = ''
let groupid = 0;
contents.forEach(line => {
    if (line.startsWith("Immune")) {
        state = 0;
        armyss = 'immune'
        groupid = 0;
    }
    if (line.startsWith("Infection")) {
        state = 1;
        armyss = 'infect'
        groupid = 0;
    }
    if (regexOuter.exec(line)) {
        ++groupid
        let data = regexOuter.exec(line)
        let group = { army: state, armyss, groupid, units: Number(data[1]), hp: Number(data[2]), dmg: Number(data[4]), initiative: Number(data[6]), att: data[5], def: [], weak: []}
        let deftypes = data[3];
        let parts = deftypes.split('; ')
        parts.forEach(part => {
            if (regexImmune.exec(part)) {
                regexImmune.exec(part)[1].split(', ').forEach(im => group.def.push(im))
            }
            if (regexWeak.exec(part)) {
                regexWeak.exec(part)[1].split(', ').forEach(im => group.weak.push(im))
            }
        })
        armys[state].push(group)
    }
})
let fighters = [].concat(immune, infect)

function effectivePower(group1) {
    return group1.units*group1.dmg;
}

function damage(group1, group2) {
    if (group2.def.indexOf(group1.att)!==-1) return 0;
    let total = effectivePower(group1);
    if (group2.weak.indexOf(group1.att)!==-1) return total*2;
    else return total;
}

function damage2(group1, group2) {
    let base = damage(group1, group2)
    let kills = Math.floor(base/group2.hp);
    if (kills > group2.units) kills = group2.units;
    //console.log(group1, group2, base, kills)
    group2.units -= kills;
}

function cmpSelection(group1, group2) {
    if (effectivePower(group1) != effectivePower(group2))
        return effectivePower(group2) - effectivePower(group1);
    else
        return group2.initiative - group1.initiative;
}

function turn() {
    //selection
    let selections = []
    fighters.sort(cmpSelection)
    fighters.forEach(fg => {
        let maxDamage = -1;
        let targetGroup = 0;
        fighters.forEach((trg, idx) => {
            if (trg.army === fg.army) return;
            if (selections.includes(trg)) return;
            let dmg = damage(fg, trg)
            if (dmg>maxDamage) {
                maxDamage = dmg
                targetGroup = idx;
            }
        })
        //console.log(fg, `would deal ${maxDamage} to`, fighters[targetGroup])
        return selections.push(targetGroup);
    })
    //console.log(selections)
    //attack
    let order = fighters.map((f, idx) => [idx, f.initiative])
    order.sort((o1,o2) => o2[1]-o1[1])
    //console.log(order)
    order.forEach(op => {
        let f1 = fighters[op[0]]
        let f2 = fighters[selections[op[0]]]
        if (f1.army!=f2.army) {
            if (f1.units>0) {
                damage2(f1, f2);
            }
        }
    })
    //remove
    fighters = fighters.filter(fi => fi.units>0)
}
let end = false;
for(let i=0;i<140;++i) {
    end = turn();
}
let sum = 0
fighters.forEach(fi => sum+=fi.units)
console.log(fighters)
console.log(sum)