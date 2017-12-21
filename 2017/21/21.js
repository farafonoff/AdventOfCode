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

function r(arr, flip) {
    let narr = [];
    let len = arr.length;
    //console.log(arr);
    for(let x=0;x<len;++x) {
        narr[x] = [];
        for(let y=0;y<len;++y) {
            if (flip) {
                narr[x][y] = arr[x][len-y-1];
            } else {
                narr[x][y] = arr[len-y-1][x];
            }
        }
    }
    return narr;
}
var cache = new HM();
function apply(arr, patterns, len) {
    let result = [];
    for(let i=0;i<arr.length;i+=len) {
        for(let j=0;j<arr.length;j+=len) {
            let tarr = []
            let options = [];
            for(let x=0;x<len;++x) {
                tarr[x] = [];
                for(let y=0;y<len;++y) {
                    tarr[x][y] = arr[i+x][j+y];
                }
            }
            let src = tarr.map(r=>r.join('')).join('/');
            let targetPattern;
            if (!cache.has(src)) {
                for(let i=0;i<4;++i) {
                    options[i] = tarr.map(r=>r.join('')).join('/');
                    tarr = r(tarr,false);
                }
                tarr = r(tarr, true);
                for(let i=4;i<8;++i) {
                    tarr = r(tarr,false);
                    options[i] = tarr.map(r=>r.join('')).join('/');
                }
                let found = patterns.filter(pattern => options.indexOf(pattern[0])!=-1)[0];
                if (!found) return arr;
                options.forEach(opt => {
                    cache.set(opt, found[1]);
                })    
                targetPattern = found[1];
            }
            targetPattern = cache.get(src);
            let rarr = targetPattern.split('/').map(r => r.split(''));
            let sx = (i/len)*(len+1);
            let sy = (j/len)*(len+1);
            for(let x=0;x<len+1;++x) {
                result[sx+x] = result[sx+x]||[];
                for(let y=0;y<len+1;++y) {
                    result[sx+x][sy+y] = rarr[x][y];
                }
            }            
            //console.log(found);
        }
    }
    return result;
}

let seed = ['.#.','..#','###'].map(r=>r.split(''));

//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/ => /));
let current = seed;
for(let iter=0;iter<18;++iter) {
    let len = 0;
    if (current.length%2==0) {
        len = 2;        
    } else 
    if (current.length%3==0) {
        len = 3;
    }
    let patterns = contents.filter(c=>c[0].length == len*len+len-1);
    //console.log(current);
    //console.log(patterns);
    current = apply(current, patterns, len);
    if (iter==4) {
        let a1 = 0;
        for(let i=0;i<current.length;++i) {
            for(j=0;j<current.length;++j) {
                if (current[i][j]==='#') ++a1;
            }
        }
        console.log('Part 1', a1);
    }
}
let a1 = 0;
for(let i=0;i<current.length;++i) {
    for(j=0;j<current.length;++j) {
        if (current[i][j]==='#') ++a1;
    }
}
console.log('Part 2', a1);