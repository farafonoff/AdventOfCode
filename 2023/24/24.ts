import * as fs from "fs";
import HM from "hashmap";
import bigDecimal from "js-big-decimal";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _, { isArray } from "lodash";
import { exit } from "process";

import { init } from 'z3-solver';

async function z3init() {
  const {
    Z3, // Low-level C-like API
    Context, // High-level Z3Py-like API
  } = await init();
  return { Z3, Context };
}



const infile = process.argv[2] || "input";

function cached<T extends Function>(fn: T): T {
  const cache = new HM();
  function inner() {
    let key = [...arguments];
    if (cache.has(key)) {
      return cache.get(key)
    }
    let res = fn(...arguments)
    cache.set(key, res)
    return res;
  }
  return inner as any;
}

function trnum(val: string): number | string {
  let nn = Number(val);
  if (val !== "" && isFinite(nn)) {
    return nn;
  }
  return val;
}
function decimalToHex(d, padding) {
  var hex = Number(d).toString(16);
  padding =
    typeof padding === "undefined" || padding === null
      ? (padding = 2)
      : padding;

  while (hex.length < padding) {
    hex = "0" + hex;
  }

  return hex;
}

const up = ([a,b]) => [a-1, b];
const down = ([a,b]) => [a+1, b];
const left = ([a,b]) => [a, b-1];
const right = ([a,b]) => [a, b+1];
const dirs = [up, down, left, right]

function incHM(tab: HM<unknown, number>, key: unknown, inc: number, dv = 0) {
  let ov = tab.get(key) || dv;
  tab.set(key, ov + inc);
}
let DEBUG = true;

function dbg(expression: any, message: string = ""): any {
  if (!DEBUG) {
    return expression;
  }
  if (message) {
    console.log(message, expression);
  } else {
    console.log(expression);
  }
  return expression;
}

function answer(part, value) {
  console.log(`Answer ${part}: ${value}`);
}

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
const tracs = []
contents.forEach((line) => {
  let [cp, vp] = line.split(' @ ')
  tracs.push([cp.split(', ').map(BigInt), vp.split(', ').map(BigInt)])
});

let least = 200000000000000n
let most = 400000000000000n
//let least = 7n
//let most = 27n

function bigMin(...numbers: bigint[]) {
  let ans = numbers[0];
  numbers.forEach(num => {
    if (ans > num) ans = num;
  })
  return ans;
}

function bigMax(...numbers: bigint[]) {
  let ans = numbers[0];
  numbers.forEach(num => {
    if (ans < num) ans = num;
  })
  return ans;
}

function between(a,b, v) {
  if (a<=v && b>=v) return true;
  if (b<=v && a>=v) return true;
  return false;
}

function intersect1(trac1, trac2) {
  function getStartEnd(trac) {
    let dt = 10000000000000n

    return [{
      x: trac[0][0],
      y: trac[0][1]
    },{
      x: trac[0][0]+dt*trac[1][0],
      y: trac[0][1]+dt*trac[1][1]
    },
    ]
  }
  let [p1, p2] = getStartEnd(trac1)
  let [q1, q2] = getStartEnd(trac2)
  let res = doLineSegmentsIntersect(p1, p2, q1, q2)
  if (typeof res !== 'boolean') {
    let [t, u, d] = res;
    let sp1 = subtractPoints(p2, p1)
    let crossX = d*p1.x + t*sp1.x;
    let crossY = d*p1.y + t*sp1.y;
    const insideArea =
      between(least * d, most * d, crossX) &&
      between(least * d, most * d, crossY)
    const inPast = t < 0 || u < 0;
    dbg([Number(crossX)/Number(d),Number(crossY)/Number(d)], insideArea?'INSIDE INTERSECTION': 'OUTSIDE INTERSECTION');
    dbg(inPast, 'INPAST')
    return insideArea && !inPast;
  } else {
    console.log([trac1, trac2], 'PARALLEL')
    return false;
  }
  /**
 * @author Peter Kelley
 * @author pgkelley4@gmail.com
 */

  /**
   * See if two line segments intersect. This uses the 
   * vector cross product approach described below:
   * http://stackoverflow.com/a/565282/786339
   * 
   * @param {Object} p point object with x and y coordinates
   *  representing the start of the 1st line.
   * @param {Object} p2 point object with x and y coordinates
   *  representing the end of the 1st line.
   * @param {Object} q point object with x and y coordinates
   *  representing the start of the 2nd line.
   * @param {Object} q2 point object with x and y coordinates
   *  representing the end of the 2nd line.
   */
  function doLineSegmentsIntersect(p, p2, q, q2) {
    var r = subtractPoints(p2, p);
    var s = subtractPoints(q2, q);

    var uNumerator = crossProduct(subtractPoints(q, p), r);
    var denominator = crossProduct(r, s);

    if (uNumerator == 0 && denominator == 0) {
      // They are coLlinear

      // Do they touch? (Are any of the points equal?)
      if (equalPoints(p, q) || equalPoints(p, q2) || equalPoints(p2, q) || equalPoints(p2, q2)) {
        return true
      }
      // Do they overlap? (Are all the point differences in either direction the same sign)
      return !allEqual(
        (q.x - p.x < 0),
        (q.x - p2.x < 0),
        (q2.x - p.x < 0),
        (q2.x - p2.x < 0)) ||
        !allEqual(
          (q.y - p.y < 0),
          (q.y - p2.y < 0),
          (q2.y - p.y < 0),
          (q2.y - p2.y < 0));
    }

    if (denominator == 0) {
      // lines are paralell
      return false;
    }

    let sgn = denominator < 0? -1n: 1n;

    var u = uNumerator * sgn;
    var t = crossProduct(subtractPoints(q, p), s) * sgn;
    dbg([t, u, denominator])

    return [t, u, denominator*sgn];
  }

  /**
   * Calculate the cross product of the two points.
   * 
   * @param {Object} point1 point object with x and y coordinates
   * @param {Object} point2 point object with x and y coordinates
   * 
   * @return the cross product result as a float
   */
  function crossProduct(point1, point2): any {
    return point1.x * point2.y - point1.y * point2.x;
  }

  /**
   * Subtract the second point from the first.
   * 
   * @param {Object} point1 point object with x and y coordinates
   * @param {Object} point2 point object with x and y coordinates
   * 
   * @return the subtraction result as a point object
   */
  function subtractPoints(point1, point2) {
    var result: any = {};
    result.x = point1.x - point2.x;
    result.y = point1.y - point2.y;

    return result;
  }

  /**
   * See if the points are equal.
   *
   * @param {Object} point1 point object with x and y coordinates
   * @param {Object} point2 point object with x and y coordinates
   *
   * @return if the points are equal
   */
  function equalPoints(point1, point2) {
    return (point1.x == point2.x) && (point1.y == point2.y)
  }

  /**
   * See if all arguments are equal.
   *
   * @param {...} args arguments that will be compared by '=='.
   *
   * @return if all arguments are equal
   */
  function allEqual(...args) {
    var firstValue = arguments[0],
      i;
    for (i = 1; i < arguments.length; i += 1) {
      if (arguments[i] != firstValue) {
        return false;
      }
    }
    return true;
  }

}

function solve2(v1, v2, v3) {
  let eqs = []
}

DEBUG = false
let ans1 = 0;
for(let i=0;i<tracs.length;++i) {
  for (let ii=i+1;ii<tracs.length;++ii) {
    if (intersect1(tracs[i], tracs[ii])) ++ans1;
  }
}

answer(1, ans1);
DEBUG = true

let eqs = []

for(let i=0;i<=3;++i) {
  const t = tracs[i]
  let eq1 = `(x-${t[0][0]})*(${t[1][1]}-b)-(y-${t[0][1]})*(${t[1][0]}-a)=0`;
  let eq2 = `(x-${t[0][0]})*(${t[1][2]}-c)-(z-${t[0][2]})*(${t[1][0]}-a)=0`
  console.log(eq1)
  console.log(eq2)
  eqs.push(eq1)
  eqs.push(eq2)
}

console.log(eqs.join(','), '{ x ,y, z, a, b, c }')

z3init().then(async ({ Z3, Context}) => {
  const { Solver, Int } = Context('main');
  const solver = new Solver();
  const [x, y, z, vx, vy, vz] = Int.consts(['x','y','z','vx','vy','vz'])
  for(let i=0;i<=5;++i) {
    const t = tracs[i]
    solver.add(x.sub(t[0][0]).mul(vy.sub(t[1][1]).neg()).sub( y.sub(t[0][1]).mul(vx.sub(t[1][0]).neg()) )    .eq(0))
    solver.add(x.sub(t[0][0]).mul(vz.sub(t[1][2]).neg()).sub( z.sub(t[0][2]).mul(vx.sub(t[1][0]).neg()) )    .eq(0))
    /*const t = tracs[i]
    let eq1 = `(x-${t[0][0]})*(${t[1][1]}-b)-(y-${t[0][1]})*(${t[1][0]}-a)=0`;
    let eq2 = `(x-${t[0][0]})*(${t[1][2]}-c)-(z-${t[0][2]})*(${t[1][0]}-a)=0`
    console.log(eq1)
    console.log(eq2)
    eqs.push(eq1)
    eqs.push(eq2)*/
  }
  const res = await solver.check()
  console.log(res)
  console.log((solver.model().eval(x.add(y).add(z)) as any).value())
  console.log((solver.model().eval(vx) as any).value())
  console.log((solver.model().eval(vy) as any).value())
  console.log((solver.model().eval(vz) as any).value())
  exit(0)
} )