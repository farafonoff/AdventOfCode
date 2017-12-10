const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')
const _ = require('lodash')

let elements = 256;

//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/, ?/).map(Number));

function hash(lengths) {
    let list = [];
    let cp = 0;
    let ss = 0;
    for(let i=0;i<elements;++i) {
        list.push(i);
    }
    //console.log(list);
    lengths.forEach(len => {
        let start = cp;
        let end = start + len - 1;
        //console.log(`${start} ${end}`)
        while(start < end) {
            let tmp = list[start%elements];
            list[start%elements] = list[end%elements];
            list[end%elements] = tmp;
            ++start;
            --end;
        }
        cp += len + ss;
        ss += 1;
        //console.log(list);        
    })
    return list[0]*list[1];
}

contents.forEach(line => {
    console.log(hash(line));
})
