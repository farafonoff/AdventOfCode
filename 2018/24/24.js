// 24   04:26:13   643      0   04:57:28   595      0
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
let regexOuter = /(\d+) units each with (\d+) hit points (?:\((.*)\) )?with an attack that does (\d+) (.*) damage at initiative (\d+)/
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
        if (deftypes) {
            let parts = deftypes.split('; ')
            parts.forEach(part => {
                if (regexImmune.exec(part)) {
                    regexImmune.exec(part)[1].split(', ').forEach(im => group.def.push(im))
                }
                if (regexWeak.exec(part)) {
                    regexWeak.exec(part)[1].split(', ').forEach(im => group.weak.push(im))
                }
            })
        }
        //console.log(group)
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
    //console.log(`${group1.armyss} group ${group1.groupid} attacks ${group2.armyss} group ${group2.groupid}, killing ${kills} units`)
    group2.units -= kills;
}

function cmpSelection(group1, group2) {
    if (effectivePower(group1) != effectivePower(group2))
        return effectivePower(group2) - effectivePower(group1);
    else
        return group2.initiative - group1.initiative;
}

function cmpTargets(atk, group1, group2) {
    let d1 = damage(atk, group1)
    let d2 = damage(atk, group2)
    if (d1!==d2) {
        return d2-d1;
    }
    if (effectivePower(group1)!==effectivePower(group2)) {
        return effectivePower(group2) - effectivePower(group1);
    }
    return group2.initiative-group1.initiative
}

function turn(fighters) {
    //selection
    let selections = []
    fighters.sort(cmpSelection)
    fighters.forEach(fg => {
        let otherArmy = fighters.filter(fo => {
            return fo.army!==fg.army&&!selections.includes(fo);
        });
        otherArmy.sort(cmpTargets.bind(null, fg))
        if (otherArmy.length===0) {
            selections.push(null)
        } else {
            let rdmg = damage(fg, otherArmy[0])
            if (rdmg>0) {
                selections.push(otherArmy[0]);
            } else {
                selections.push(null);
            }    
        }
        //console.log(fg, `would deal ${maxDamage} to`, fighters[targetGroup])
        
    })
    //console.log(selections)
    let finish = true;
    fighters.forEach(fi => {
        if (fi.army!==fighters[0].army) {
            finish = false;            
        }
    })
    if (finish)
    {
        let sum = 0;
        fighters.forEach(fi => sum+=fi.units);
        return [fighters[0].armyss, fighters, sum];
    }
    //attack
    let order = fighters.map((f, idx) => [idx, f.initiative])
    order.sort((o1,o2) => o2[1]-o1[1])
    //console.log(order)
    order.forEach(op => {
        if (selections[op[0]]) {
            let f1 = fighters[op[0]]
            let f2 = selections[op[0]]
            if (f1.units > 0) {
                damage2(f1, f2);
            }
        }
    })
    //remove
    fighters = fighters.filter(fi => fi.units>0)
    let sum = 0;
    fighters.forEach(fi => sum+=fi.units)
    return [null, fighters, sum]
    //console.log('round')
}
function simulate(fighters, boost) {
    let end;
    let copy = _.cloneDeep(fighters);
    copy.forEach(fi => { if (fi.army === 0) fi.dmg+=boost });
    let sum = 0
    let oldsum = 0;
    let round = 0;
    while(!end) {
        [end, copy, sum] = turn(copy);
        if (!end&&sum===oldsum) {
            return ('stuck')
        }
        /*if (round%10000 === 9999) {
            console.log(round, end, sum)
        }*/
        oldsum = sum;
        ++round;
    }
    return [end, sum];
}

/*ans1 = simulate(fighters, 0)
console.log(ans1)*/
let lbound = 0
let ubound = 1000000000;
let ans2,res2;
console.log('Part 1:', simulate(fighters, 0))
while((ubound-lbound)>1) {
    ans2 = Math.floor((ubound+lbound)/2)
    //console.log(lbound, ubound, ans2)
    res2 = simulate(fighters, ans2)
    //console.log(ans)
    if (res2[0]==='immune') {
        ubound = ans2;
    } else {
        lbound = ans2;
    }
}
console.log('Part 2:', simulate(fighters, ubound))
