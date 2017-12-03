const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')

//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));

function pos(id) {
    id -= 1;
    let ring = Math.floor(Math.sqrt(id));
    if (ring%2==0) {
        ring -=1;
    }
    //console.log(ring);
    let rid = id - ring * ring;
    let side = ring + 1;
    let sn = rid % side;
    if (ring > 2) {
        sn -= (ring - 1) / 2;
    }
    //console.log(`${ring} ${sn}`);      
    sn = Math.abs(sn);    
    sn += ( ring + 1 ) /2;
    console.log(sn);
}

contents.forEach(input => {
    let id = input[0];
    pos(id);
})
console.log(contents);