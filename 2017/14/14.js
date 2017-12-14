const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')
const _ = require('lodash')
function decimalToHex(d, padding, base) {
    var hex = Number(d).toString(base||16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}


let elements = 256;
let suffix = [17, 31, 73, 47, 23];


function hash(line) {
    let inp = line.split('').map(s => s.charCodeAt(0));
    let lengths = inp.concat(suffix);
    let list = [];
    let cp = 0;
    let ss = 0;
    for(let i=0;i<elements;++i) {
        list.push(i);
    }
    //console.log(list);
    for(let r = 0;r<64;++r) {
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
    }
    //dense it
    let result = new Array(16);
    result.fill(0,0,result.length);
    for(let i=0;i<16;++i) {
        for(let j=0;j<16;++j) {
            result[i] = result[i]^list[i*16+j];
        }
    }
    let answer = "";
    result.forEach(r => {
        answer += decimalToHex(r,8,2);
    })
    //console.log(result);
    return answer;
    //return list[0]*list[1];
}

//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);

contents.forEach(line => {
    console.log(line);
    ans = 0;
    let field = [];
    for(let i=0;i<128;++i) {
        let row = `${line}-${i}`;
        let hr = hash(row);
        let fr = [];
        hr.split('').forEach(c => {
            if (c==='1') {
                ++ans;
                fr.push(0);
            } else {
                fr.push('.');
            }
        })
        field.push(fr);
        //console.log(hash(row));
    }
    console.log('Puzzle1', ans);
    
    function markRegion(x,y,id) {
        field[x][y] = id;
        if (y<127&&field[x][y+1]===0) markRegion(x,y+1,id);
        if (y>0 &&field[x][y-1]===0) markRegion(x,y-1,id);
        if (x<127&&field[x+1][y]===0) markRegion(x+1,y,id);
        if (x>0 &&field[x-1][y]===0) markRegion(x-1,y,id);
    }
    let rid = 0;
    for(let i=0;i<128;++i) {
        for(let j=0;j<128;++j) {
            if (field[i][j]===0) {
                ++rid;
                markRegion(i,j,rid);
            }
        }
    }
    console.log('Puzzle2', rid);
})

