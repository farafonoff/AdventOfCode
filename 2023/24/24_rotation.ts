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

  let sgn = denominator < 0 ? -1 : 1;

  var u = uNumerator * sgn;
  var t = crossProduct(subtractPoints(q, p), s) * sgn;
  //dbg([t, u, denominator])

  return [t, u, denominator * sgn];
}

function getIntersectionPoint(trac1, trac2) {
  let leasti = 0;
  let mosti = 500000000000000;
  function getStartEnd(trac) {
    let dt = 100000

    return [{
      x: trac[0][0],
      y: trac[0][1]
    }, {
      x: trac[0][0] + dt * trac[1][0],
      y: trac[0][1] + dt * trac[1][1]
    },
    ]
  }
  let [p1, p2] = getStartEnd(trac1)
  let [q1, q2] = getStartEnd(trac2)
  let res = doLineSegmentsIntersect(p1, p2, q1, q2)
  if (typeof res !== 'boolean') {
    let [t, u, d] = res;
    let sp1 = subtractPoints(p2, p1)
    let crossX = d * p1.x + t * sp1.x;
    let crossY = d * p1.y + t * sp1.y;
    const insideArea =
      between(leasti * d, mosti * d, crossX) &&
      between(leasti * d, mosti * d, crossY)
    const inPast = t < 0 || u < 0;
    dbg([Number(crossX) / Number(d), Number(crossY) / Number(d)], insideArea ? 'INSIDE INTERSECTION' : 'OUTSIDE INTERSECTION');
    dbg(inPast, 'INPAST')
    if (insideArea && !inPast) {
      return [Number(crossX) / Number(d), Number(crossY) / Number(d)]
    }
  }
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

const up = ([a, b]) => [a - 1, b];
const down = ([a, b]) => [a + 1, b];
const left = ([a, b]) => [a, b - 1];
const right = ([a, b]) => [a, b + 1];
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
  tracs.push([cp.split(', ').map(Number), vp.split(', ').map(Number)])
});

let least = 200000000000000
let most = 400000000000000
//let least = 7n
//let most = 27n

function bigMin(...numbers: number[]) {
  let ans = numbers[0];
  numbers.forEach(num => {
    if (ans > num) ans = num;
  })
  return ans;
}

function bigMax(...numbers: number[]) {
  let ans = numbers[0];
  numbers.forEach(num => {
    if (ans < num) ans = num;
  })
  return ans;
}

function between(a, b, v) {
  if (a <= v && b >= v) return true;
  if (b <= v && a >= v) return true;
  return false;
}

function intersect1(trac1, trac2) {
  function getStartEnd(trac) {
    let dt = 10000000000000

    return [{
      x: trac[0][0],
      y: trac[0][1]
    }, {
      x: trac[0][0] + dt * trac[1][0],
      y: trac[0][1] + dt * trac[1][1]
    },
    ]
  }
  let [p1, p2] = getStartEnd(trac1)
  let [q1, q2] = getStartEnd(trac2)
  let res = doLineSegmentsIntersect(p1, p2, q1, q2)
  if (typeof res !== 'boolean') {
    let [t, u, d] = res;
    let sp1 = subtractPoints(p2, p1)
    let crossX = d * p1.x + t * sp1.x;
    let crossY = d * p1.y + t * sp1.y;
    const insideArea =
      between(least * d, most * d, crossX) &&
      between(least * d, most * d, crossY)
    const inPast = t < 0 || u < 0;
    dbg([Number(crossX) / Number(d), Number(crossY) / Number(d)], insideArea ? 'INSIDE INTERSECTION' : 'OUTSIDE INTERSECTION');
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

}

DEBUG = false
let ans1 = 0;
for (let i = 0; i < tracs.length; ++i) {
  for (let ii = i + 1; ii < tracs.length; ++ii) {
    if (intersect1(tracs[i], tracs[ii])) ++ans1;
  }
}

answer(1, ans1);
DEBUG = true

let eqs = []

for (let i = 0; i <= 3; ++i) {
  const t = tracs[i]
  let eq1 = `(x-${t[0][0]})*(${t[1][1]}-b)-(y-${t[0][1]})*(${t[1][0]}-a)=0`;
  let eq2 = `(x-${t[0][0]})*(${t[1][2]}-c)-(z-${t[0][2]})*(${t[1][0]}-a)=0`
  dbg(eq1)
  dbg(eq2)
  eqs.push(eq1)
  eqs.push(eq2)
}

console.log(eqs.join(','), '{ x ,y, z, a, b, c }')

function solveZ3() {
  z3init().then(async ({ Z3, Context }) => {
    const { Solver, Int } = Context('main');
    const solver = new Solver();
    const [x, y, z, vx, vy, vz] = Int.consts(['x', 'y', 'z', 'vx', 'vy', 'vz'])
    for (let i = 0; i <= 5; ++i) {
      const t = tracs[i]
      solver.add(x.sub(t[0][0]).mul(vy.sub(t[1][1]).neg()).sub(y.sub(t[0][1]).mul(vx.sub(t[1][0]).neg())).eq(0))
      solver.add(x.sub(t[0][0]).mul(vz.sub(t[1][2]).neg()).sub(z.sub(t[0][2]).mul(vx.sub(t[1][0]).neg())).eq(0))
    }
    const res = await solver.check()
    dbg(res)
    dbg((solver.model().eval(x) as any).value())
    dbg((solver.model().eval(y) as any).value())
    dbg((solver.model().eval(z) as any).value())
    dbg((solver.model().eval(vx) as any).value())
    dbg((solver.model().eval(vy) as any).value())
    dbg((solver.model().eval(vz) as any).value())
    answer(2, (solver.model().eval(x.add(y).add(z)) as any).value())
    exit(0)
  })
}

class Vector3 {
  constructor(public x: number, public y: number, public z: number) { }

  static cross(v1: Vector3, v2: Vector3): Vector3 {
    return new Vector3(
      v1.y * v2.z - v1.z * v2.y,
      v1.z * v2.x - v1.x * v2.z,
      v1.x * v2.y - v1.y * v2.x
    );
  }

  static dot(v1: Vector3, v2: Vector3): number {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }

  static normalize(v: Vector3): Vector3 {
    const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return new Vector3(v.x / length, v.y / length, v.z / length);
  }
}

function rotationMatrixFromVectors(v1: Vector3, v2: Vector3): number[][] {
  // Ensure vectors are unit vectors
  v1 = Vector3.normalize(v1);
  v2 = Vector3.normalize(v2);

  // Compute the rotation axis and angle
  const axis = Vector3.cross(v1, v2);
  const angle = Math.acos(Vector3.dot(v1, v2));

  // If the vectors are already aligned, return the identity matrix
  if (Math.abs(angle) < 1e-10) {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
  }

  // Normalize the rotation axis
  const normAxis = Vector3.normalize(axis);

  // Compute the rotation matrix using the Rodrigues' rotation formula
  const cosTheta = Math.cos(angle);
  const sinTheta = Math.sin(angle);
  const crossMatrix = [
    [0, -normAxis.z, normAxis.y],
    [normAxis.z, 0, -normAxis.x],
    [-normAxis.y, normAxis.x, 0],
  ];

  const R: number[][] = [
    [cosTheta + normAxis.x * normAxis.x * (1 - cosTheta), normAxis.x * normAxis.y * (1 - cosTheta) - normAxis.z * sinTheta, normAxis.x * normAxis.z * (1 - cosTheta) + normAxis.y * sinTheta],
    [normAxis.y * normAxis.x * (1 - cosTheta) + normAxis.z * sinTheta, cosTheta + normAxis.y * normAxis.y * (1 - cosTheta), normAxis.y * normAxis.z * (1 - cosTheta) - normAxis.x * sinTheta],
    [normAxis.z * normAxis.x * (1 - cosTheta) - normAxis.y * sinTheta, normAxis.z * normAxis.y * (1 - cosTheta) + normAxis.x * sinTheta, cosTheta + normAxis.z * normAxis.z * (1 - cosTheta)],
  ];

  return R;
}

function rotateVector(vector: Vector3, rotationMatrix: number[][]): Vector3 {
  // Apply the rotation matrix
  const rotatedVector = new Vector3(
    rotationMatrix[0][0] * vector.x + rotationMatrix[0][1] * vector.y + rotationMatrix[0][2] * vector.z,
    rotationMatrix[1][0] * vector.x + rotationMatrix[1][1] * vector.y + rotationMatrix[1][2] * vector.z,
    rotationMatrix[2][0] * vector.x + rotationMatrix[2][1] * vector.y + rotationMatrix[2][2] * vector.z
  );

  return rotatedVector;
}
DEBUG = false
function solveBruteforce() {
  for (let vx = 0; vx <= 50; ++vx) {
    for (let vy = -300; vy <= -250; ++vy) {
      for (let vz = 100; vz <= 150; ++vz) {
      /*const vx = 28
      const vy = -286
      const vz = 123*/
        const rot = rotationMatrixFromVectors(new Vector3(Number(vx), Number(vy), Number(vz)), new Vector3(0, 0, 1));
        const baseRotated = rotateVector(new Vector3(Number(vx), Number(vy), Number(vz)), rot);
        const rotated = tracs.slice(0,6).map(([point, velocity]) => {
          return [rotateVector(new Vector3(Number(point[0]), Number(point[1]), Number(point[2])), rot),
          rotateVector(new Vector3(Number(velocity[0]), Number(velocity[1]), Number(velocity[2])), rot)]
        })

        const intersection1 = getIntersectionPoint(
          [[rotated[0][0].x, rotated[0][0].y], [rotated[0][1].x, rotated[0][1].y]],
          [[rotated[1][0].x, rotated[1][0].y], [rotated[1][1].x, rotated[1][1].y]],
        );
        const intersection2 = getIntersectionPoint(
          [[rotated[2][0].x, rotated[2][0].y], [rotated[2][1].x, rotated[2][1].y]],
          [[rotated[3][0].x, rotated[3][0].y], [rotated[3][1].x, rotated[3][1].y]],
        );
        const intersection3 = getIntersectionPoint(
          [[rotated[4][0].x, rotated[4][0].y], [rotated[4][1].x, rotated[4][1].y]],
          [[rotated[5][0].x, rotated[5][0].y], [rotated[5][1].x, rotated[5][1].y]],
        );
        if (intersection1 && intersection2) {
          if (Math.abs(intersection1[0] - intersection2[0]) < 100000 && Math.abs(intersection1[1] - intersection2[1]) < 100000 ) {
            console.log([intersection1, intersection2, intersection3], 'INTERSECTIONS MATCH?')
            //console.log([vx, vy, vz]);
          }
        }
      }
    }
  }
}

solveBruteforce();