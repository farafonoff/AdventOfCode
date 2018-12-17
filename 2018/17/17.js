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
var re = /([xy])=(\d+), ([xy])=(\d+)..(\d+)/
let xr = [Infinity, -Infinity]
let yr = [0, -Infinity]
let hm = new HM();
contents.forEach(line => {
    var match = re.exec(line);
    if (match) {
        let v1 = match[1];
        let v2 = match[3];
        let v1v = Number(match[2])
        let v2r = [Number(match[4]),Number(match[5])]
        if (v1 === 'x') {
            for(let y = v2r[0];y<=v2r[1];++y) {
                hm.set([v1v,y],{t:'#'});
            }
            yr[0] = Math.min(yr[0], v2r[0])
            yr[1] = Math.max(yr[1], v2r[1])
            xr[0] = Math.min(xr[0], v1v)
            xr[1] = Math.max(xr[1], v1v)
        }
        if (v1 === 'y') {
            for(let x = v2r[0];x<=v2r[1];++x) {
                hm.set([x,v1v],{t:'#'});
            }
            xr[0] = Math.min(xr[0], v2r[0])
            xr[1] = Math.max(xr[1], v2r[1])
            yr[0] = Math.min(yr[0], v1v)
            yr[1] = Math.max(yr[1], v1v)
        }
    }
})
console.log(xr,yr);
dump = (log) => {
    let res = 0;
    for(let y = yr[0]; y<=yr[1];++y){
        let ln = '';
        for(let x = xr[0]; x<=xr[1];++x){
            if (hm.has([x,y])) {
                if (hm.get([x,y]).t!='#') ++res;
                ln+=hm.get([x,y]).t
            } else {
                ln += '.';
            }
        }
        if (log) console.log(ln);
    }
    return res;
}
//dump(true);
let fd = (stream) => {let r = [...stream]; r[1]+=1; return r;}
let fu = (stream) => {let r = [...stream]; r[1]-=1; return r;}
let fr = (stream) => {let r = [...stream]; r[0]+=1; return r;}
let fl = (stream) => {let r = [...stream]; r[0]-=1; return r;}
let streams = [[500,0]];
for(let round=0;round<2000;++round) {
    streams.forEach((stream,idx) => {
        if (hm.has(fd(stream))){
            if (true || hm.get(fd(stream)).t === '#') {
                let lp = fl(stream);
                let rp = fr(stream);
                hm.set(stream, {t:'~'})
                while(!hm.has(lp)&&hm.has(fd(lp))) {
                    hm.set(lp, {t:'~'})
                    lp = fl(lp)
                }
                while(!hm.has(rp)&&hm.has(fd(rp))) {
                    hm.set(rp, {t:'~'})
                    rp = fr(rp)
                }
                let overflow = false;
                if (!hm.has(fd(rp))) {
                    overflow = true;
                    hm.set(rp, {t:'|'})
                    streams.push(rp)
                }
                if (!hm.has(fd(lp))) {
                    overflow = true;
                    hm.set(lp, {t:'|'})
                    streams.push(lp)
                }
                if (overflow) {
                    streams[idx] = undefined;
                } else {
                    streams[idx] = fu(stream);
                }    
            } else {
                streams[idx] = undefined;
            }
        } else {
            streams[idx] = fd(stream);
            hm.set(fd(stream), {t:'|'})
        }
    })
    streams = streams.filter(stream => !!stream)
    if (round%1000==0) console.log(round, streams);
    /*let water = hm.keys().reduce((s,key) => {
        if (hm.get(key).t!=='#') {
            return s+1;
        } else {
            return s;
        }
    }, 0);*/
    //dump(true)
    /*if (round%10000==0)  {
        let water = dump(true);
        console.log(streams);
        console.log(water)
    }*/
}
let water = dump(true);
console.log(streams);
console.log(water)