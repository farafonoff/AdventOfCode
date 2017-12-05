const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')
let puzzle=1;
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
let ip = 0;
let pc = 0;
while (ip>=0&&ip<contents.length) {
    let jp = contents[ip][0];
    if ( puzzle===2 && jp>=3 ) {
        contents[ip][0]--;        
    } else {
        contents[ip][0]++;
    }
    ip+=jp;
    ++pc;
}
console.log(pc);
