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

//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/p=<(-?\d+),(-?\d+),(-?\d+)>, v=<(-?\d+),(-?\d+),(-?\d+)>, a=<(-?\d+),(-?\d+),(-?\d+)>/));

let iters = 1000000000000;

function calcPoint(match) {
    let nums = [];
    for(let i=1;i<10;++i) {
        nums.push(Number(match[i]));
    }
    //console.log(nums);
    let x = nums[0]+nums[3]*iters+nums[6]*iters*(iters+1)/2;
    let y = nums[1]+nums[4]*iters+nums[7]*iters*(iters+1)/2;
    let z = nums[2]+nums[5]*iters+nums[8]*iters*(iters+1)/2;
    let dist = Math.abs(x)+Math.abs(y)+Math.abs(z);
    return dist;
}

function solve(point1, point2, coord) {
    let c = point1[coord]-point2[coord];
    let b = point1[coord+3]-point2[coord+3]+(point1[coord+6]-point2[coord+6])/2;
    let a = (point1[coord+6]-point2[coord+6])/2;
    let sol;
    if (a==0) {
        if (b==0) {
            if (c==0) {
                sol = [ Infinity ];
            } else sol = [];
        } else {
            let s = -c/b;
            sol = [s];    
        }
    } else {
        let D = b*b-4*a*c;
        if (D>=0) {
            let s1 = (-b+Math.sqrt(D))/2/a;
            let s2 = (-b-Math.sqrt(D))/2/a;
            sol = [s1,s2];
        } else sol = [];
    }
    return sol.filter(v => !isFinite(v)||v>=0&&Number.isInteger(v));
}

function collide(match1, match2) {
    let nums1 = [];
    for(let i=1;i<10;++i) {
        nums1.push(Number(match1[i]));
    }
    let nums2 = [];
    for(let i=1;i<10;++i) {
        nums2.push(Number(match2[i]));
    }
    //console.log(nums1, nums2)
    let sols = [solve(nums1, nums2, 0),solve(nums1, nums2, 1), solve(nums1, nums2, 2)];
    sols = sols.filter(sol => sol.length==0||isFinite(sol[0]));
    if (sols.length == 0) return 0;
    let crs = sols[0];
    for(let s=1;s<sols.length;++s) {
        crs = crs.filter(cr => sols[s].indexOf(cr)!=-1);
    }
    //console.log(crs);
    return Math.min.apply(Math, crs);
}

let dists = [];
contents.forEach(line => {
    dists.push(calcPoint(line));
})
let mdist = Math.min.apply(Math, dists);
console.log(dists.indexOf(mdist));
for(let i=0;i<contents.length;++i) {
    contents.oi = i;
}
for(let i=0;i<contents.length;++i) {
    let fc = [];
    for(let i=0;i<contents.length;++i) {
        let collisions = [];
        for(let j=0;j<contents.length;++j) {
            if (i!=j) {
                let collision = collide(contents[i], contents[j]);
                collisions.push(collision);    
            }
        }
        let mc = Math.min.apply(Math, collisions)
        fc.push(mc);
    }
    let mmc = Math.min.apply(Math, fc);
    if (!isFinite(mmc)) break;
    contents = contents.filter((v,k) => fc[k]>mmc);
    console.log(mmc, contents.length);
}
console.log(contents.length);