const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')

//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/));//.map(Number));

let puzzle = 2;

function isValidPf(words) {
    let hm = new HM();
    let valid = true;
    words.forEach(word => {
        let ssw;
        if (puzzle === 2) {
            let sw = word.split('');
            sw.sort();
            ssw = sw.join('');    
        } else {
            ssw = word;
        }
        if (hm.has(ssw)) {
            valid = false;
        }
        hm.set(ssw, true);
    });
    console.log(valid);
    return valid;
}

let a = contents.filter(isValidPf).length
console.log(a);
//console.log(contents);
