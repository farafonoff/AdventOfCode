const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')

//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));

function distribute(row) {
    let maxVal = Math.max.apply(Math, row);
    let maxIdx = row.findIndex(v => v === maxVal);
    row[maxIdx] = 0;
    for(let i=0;i<maxVal;++i) {
        let tg = (1+maxIdx+i)%row.length;
        ++row[tg];
    }
}

contents.forEach(puz => {
    console.log(puz);
    let hm = new HM();
    let op = 0;
    let pd = puz.join('|');
    do {
        hm.set(pd, op);
        ++op;
        distribute(puz);
        pd = puz.join('|');
    } while (!hm.has(pd));
    console.log(op);
    console.log(op - hm.get(pd));
})

