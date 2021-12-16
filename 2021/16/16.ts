import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _, { reduce } from "lodash";
const infile = process.argv[2] || "input";

function trnum(val: string): number | string {
  let nn = Number(val);
  if (isFinite(nn)) {
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

function decimalToBin(d, padding) {
  var hex = Number(d).toString(2);
  padding =
    typeof padding === "undefined" || padding === null
      ? (padding = 2)
      : padding;

  while (hex.length < padding) {
    hex = "0" + hex;
  }

  return hex;
}

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
//var contents = s.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let ans1 = 0;
function consume(sequence: number[], bits: number, startBit: number) {
  let result = sequence.slice(startBit, startBit + bits);
  return [result, startBit + bits];
}
function bitStrToInt(seq: number[]) {
  return parseInt(seq.join(""), 2);
}
function decodeLiteral(sequence, startBit) {
  let pointer = startBit;
  let group;
  let result = [];
  do {
    [group, pointer] = consume(sequence, 5, pointer);
    result = [...result, ...(consume(group, 4, 1)[0] as number[])];
  } while (group[0] === 1);
  return [bitStrToInt(result), pointer];
}
class Packet {
  version: number;
  type: number;
  literal?: number;
  content?: Packet[];
}
function decodePacket(sequence, startBit) {
  let pointer = startBit;
  let version, type;
  let result = new Packet();
  [version, pointer] = consume(sequence, 3, pointer);
  [type, pointer] = consume(sequence, 3, pointer);
  version = dbg(bitStrToInt(version), "version");
  ans1 += version;
  type = dbg(bitStrToInt(type), "type");
  result.version = version;
  result.type = type;
  switch (type) {
    case 4: {
      let literalNumber;
      [literalNumber, pointer] = decodeLiteral(sequence, pointer);
      result.literal = dbg(literalNumber, "literal");
      break;
    }
    default: {
      // operator
      let lengthMode;
      [lengthMode, pointer] = consume(sequence, 1, pointer);
      switch (lengthMode[0]) {
        case 0: {
          let contentBits;
          [contentBits, pointer] = consume(sequence, 15, pointer);
          contentBits = dbg(bitStrToInt(contentBits), "bits");
          let subseq;
          [subseq, pointer] = consume(sequence, contentBits, pointer);
          let localPointer = 0;
          let pack: Packet;
          result.content = [];
          while (localPointer < contentBits) {
            [pack, localPointer] = decodePacket(subseq, localPointer);
            result.content.push(pack);
          }
          break;
        }
        case 1: {
          let contentPackets;
          [contentPackets, pointer] = consume(sequence, 11, pointer);
          contentPackets = dbg(bitStrToInt(contentPackets), "packets");
          let pack: Packet;
          result.content = [];
          for (let i = 0; i < contentPackets; ++i) {
            [pack, pointer] = decodePacket(sequence, pointer);
            result.content.push(pack);
          }
          break;
        }
      }
    }
  }
  return [result, pointer];
}
function parsePacket(s) {
  let bits = _.flatten(
    s
      .split("")
      .map((hn) => decimalToBin(parseInt(hn, 16), 4).split("").map(Number))
  );
  dbg(bits.join(""));
  return decodePacket(bits, 0)[0];
}
DEBUG = false;
function compute(data: Packet) {
  switch (data.type) {
    case 0:
      return _.sum(data.content.map(compute));
    case 1:
      return data.content.map(compute).reduce((pv, cv) => pv * cv, 1);
    case 2:
      return Math.min.apply(null, data.content.map(compute));
    case 3:
      return Math.max.apply(null, data.content.map(compute));
    case 4:
      return data.literal;
    case 5: {
      let items = data.content.map(compute);
      return items[0] > items[1] ? 1 : 0;
    }
    case 6: {
      let items = data.content.map(compute);
      return items[0] < items[1] ? 1 : 0;
    }
    case 7: {
      let items = data.content.map(compute);
      return items[0] == items[1] ? 1 : 0;
    }
  }
}
contents.forEach((line) => {
  ans1 = 0;
  dbg(line);
  let parsed = dbg(parsePacket(line));
  answer(1, ans1);
  //console.log(JSON.stringify(parsed, null, 2));
  let ans2 = compute(parsed);
  answer(2, ans2);
});
