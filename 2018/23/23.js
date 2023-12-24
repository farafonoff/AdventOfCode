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
var rex = /pos=<(-?\d+),(-?\d+),(-?\d+)>, r=(-?\d+)/
let bots = []
contents.forEach(line => {
    if (rex.exec(line)) {
        bots.push(rex.exec(line).slice(1).map(Number))
    }
})
let max = bots.reduce((max, current) => current[3]>max[3]?current:max,bots[0]);
let inrange = bots.filter(bot => {
    let dist = bot.slice(0,3).map((c,idx)=>Math.abs(max[idx]-c)).reduce((s,v)=>s+v,0)
    return dist<=max[3];
})
console.log('Answer 1:', inrange.length)

let { init } = require('z3-solver')

function zAbs(context, x) {
    return context.If(x.ge(0), x, x.neg())
}

async function solve2() {
    const { Context } = await init()
    const context = Context('23-2')
    const { Solver, Optimize, Int } = context;
    const solver = new Optimize()
    const [x, y, z, matches, mindist] = Int.consts(['x', 'y', 'z', 'matches', 'mindist'])
    const botFits = []
    bots.forEach((bot,idx) => {
        const botFit = Int.const(`botfit_${idx}`)
        solver.add(
            botFit.eq(context.If(
                (zAbs(context, x.sub(bot[0]))
                .add(zAbs(context, y.sub(bot[1])))
                .add(zAbs(context, z.sub(bot[2])))).le(bot[3]), 1, 0)))
        botFits.push(botFit)
    });
    const totalSum = botFits.reduce((a,b) => a.add(b))
    solver.add(matches.eq(totalSum))
    solver.add(mindist
        .eq(
            zAbs(context, x)
                .add(zAbs(context, y))
                .add(zAbs(context, z))
        )
    )
    solver.maximize(matches)
    solver.minimize(mindist)
    console.log(await solver.check())
    const myVars = [x, y, z, matches, mindist]
    myVars.forEach(con => {
        console.log(solver.model().get(con).value())
    })
    console.log('Answer 2: ', solver.model().get(mindist).value())
    exit(0)
}

solve2();
/*
console.log(`array[0..${bots.length-1}] of var int: cubes;`)
bots.forEach((bot,idx) => {
    console.log(`constraint cubes[${idx}]=if (abs(x- ${bot[0]})+abs(y- ${bot[1]})+abs(z- ${bot[2]})<=${bot[3]}) then 1 else 0 endif;`)
})
*/