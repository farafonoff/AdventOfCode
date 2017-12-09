const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')
const _ = require('lodash')

//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0)/*.map(s => s.split(/[ \t]/).map(Number))*/;

function count(line, score, start) {
    let garbage = false;
    let cancel = false;
    let idx = start;
    let currentScore = score;
    let balance = 1;
    let garbages = 0;
    while (balance > 0 && idx < line.length) {
        //console.log(`${idx} ${line[idx]} ${cancel} ${garbage}`);
        if (!cancel) {
            if (garbage && line[idx] === '!') {
                cancel = true;
            }
            if (line[idx] === '>') {
                garbage = false;
            }
            if (garbage && !cancel) {
                garbages += 1;
            }
            if (line[idx] === '<') {
                garbage = true;
            }
        } else {
            cancel = false;
        }
        if (!garbage) {
            if (line[idx] === '}') {
                balance -= 1;
                score -= 1;
            }
            if (line[idx] === '{') {
                score += 1;
                currentScore += score;
                balance += 1;
            }
        }
        ++idx;
    }
    return [currentScore, garbages];
}
console.log('part1, part2')
contents.forEach(line => {
    //console.log(line);
    console.log(count(line.split(''), 1, 1));
})
