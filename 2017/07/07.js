const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')
const _ = require('lodash')

//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/)/*.map(Number)*/);

let verts = [];
let weights = [];
let adj = new Array(contents.length);
for(let i=0;i<contents.length;++i ) {
    adj[i] = new Array(contents.length);
    _.fill(adj[i], 0)
}
contents.forEach(line => {
    let vert = line[0];
    let weight = line[1].split(/[()]/);
    verts.push(vert);
    weights.push(Number(weight[1]))
})
//console.log(verts);
contents.forEach(line => {
    //console.log(line);
    let vert = verts.indexOf(line[0]);
    for(let i=3;i<line.length;++i) {
        let li = line[i];
        li = li.split(',');
        let vr = verts.indexOf(li[0]);
        if (vr===-1) {
            console.log(line[i]);
        }
        adj[vert][vr] += 1;
    }
})
let ans1;
for(let i=0;i<verts.length;++i) {
    let ans = true;
    for(let j=0;j<verts.length;++j) {
        if (adj[j][i] != 0) {
            ans = false;
        }
    }
    if (ans) {
        ans1 = i;
        console.log(verts[i]);
    }
}
let totalWeights = new Array(verts.length);
let ans2 = -1;
function getWeight(n) {
    let ans = weights[n];
    if (!totalWeights[n]) {
        let upWeights = [];
        let upWeights1 = [];
        adj[n].forEach((ad, idx) => {
            if (ad!=0) {
                let rest = getWeight(idx);
                upWeights[idx] = rest;
                upWeights1.push(rest);
                ans += rest;
            }
        })
        upWeights1.sort();
        let unik = _.uniq(upWeights1);
        if (unik.length > 1) {
            let ucv = unik.map(uv => {
                return _.filter(upWeights1, ve => ve === uv).length;
            })
            let uweight = unik[ucv.indexOf(1)];
            let oweight = unik.find((w,i) => ucv[i] > 1);
            let upNode = upWeights.indexOf(uweight);
            if (ans2<0) {
                ans2 = weights[upNode] + oweight-uweight;
            }
        }
    } else {
        ans = totalWeights[n];
    }
    totalWeights[n] = ans;
    return ans;
}
//console.log(weights);
//console.log(adj);
getWeight(ans1);
console.log(ans2);
//console.log(totalWeights);