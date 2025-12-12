import * as fs from "fs";
import { spawn } from "child_process";

const infile = process.argv[2] || "input";

function answer(part, value) {
  console.log(`Answer ${part}: ${value}`);
}

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trimEnd());

// Parse regions to get count
const regions: {width: number, height: number, counts: number[]}[] = [];
let i = 0;
while (i < contents.length) {
  const line = contents[i].trim();
  if (line === "") {
    i++;
    continue;
  }
  if (line.match(/^\d+:$/)) {
    i++;
    while (i < contents.length && contents[i].trim() !== "" && !contents[i].includes(":") && !contents[i].includes("x")) {
      i++;
    }
  } else {
    break;
  }
}

while (i < contents.length) {
  if (contents[i].trim() === "") {
    i++;
    continue;
  }
  const match = contents[i].match(/(\d+)x(\d+): (.+)/);
  if (match) {
    const width = Number(match[1]);
    const height = Number(match[2]);
    const counts = match[3].split(" ").map(Number);
    regions.push({width, height, counts});
  }
  i++;
}

const NUM_WORKERS = 8;
const totalRegions = regions.length;
const chunkSize = Math.ceil(totalRegions / NUM_WORKERS);

console.log(`Processing ${totalRegions} regions with ${NUM_WORKERS} workers`);

const workers: Promise<any[]>[] = [];

for (let w = 0; w < NUM_WORKERS; w++) {
  const startIdx = w * chunkSize;
  const endIdx = Math.min((w + 1) * chunkSize, totalRegions);
  
  if (startIdx >= totalRegions) break;
  
  console.log(`Worker ${w}: processing regions ${startIdx} to ${endIdx - 1}`);
  
  const promise = new Promise<any[]>((resolve, reject) => {
    const worker = spawn('npx', ['ts-node', '12-worker.ts', infile, startIdx.toString(), endIdx.toString()], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    worker.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    worker.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    worker.on('close', (code) => {
      if (code !== 0) {
        console.error(`Worker ${w} error:`, stderr);
        reject(new Error(`Worker ${w} exited with code ${code}`));
      } else {
        try {
          const results = JSON.parse(stdout);
          resolve(results);
        } catch (e) {
          console.error(`Worker ${w} output:`, stdout);
          reject(e);
        }
      }
    });
  });
  
  workers.push(promise);
}

Promise.all(workers).then((allResults) => {
  const flatResults = allResults.flat();
  flatResults.sort((a, b) => a.idx - b.idx);
  
  let count = 0;
  for (const result of flatResults) {
    console.log(`Region ${result.idx} (${result.width}x${result.height}, presents: ${result.counts.join(',')}): ${result.fits ? 'YES' : 'NO'} in ${result.elapsed}ms (${result.tries} tries)`);
    if (result.fits) {
      count++;
    }
  }
  
  answer(1, count);
}).catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
