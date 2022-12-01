// put cookie to 'cookie' file in format:
// session=.....

import * as fs from "fs";
import * as https from "https";

const year = new Date().getFullYear();
const day = Number(process.argv[2]);
console.log("running for day", day);

const sday = day < 10 ? `0${day}` : `${day}`;
function buildPuzzleStart(year, day) {
  return new Date(`${year}-12-${sday}T05:00:00.000Z`);
}

let cookie = fs.readFileSync("cookie", "utf-8");

console.log(cookie);

function downloadInput() {
  const options: https.RequestOptions = {
    hostname: "adventofcode.com",
    port: 443,
    path: `/${year}/day/${day}/input`,
    method: "GET",
    headers: { cookie },
  };
  let req = https.request(options, (res) => {
    const date = new Date(res.headers.date);
    if (res.statusCode === 404) {
      const targetDate = buildPuzzleStart(year, day);
      let diff = targetDate.getTime() - date.getTime();
      const maxSleep = 60 * 1000 * 15; // 15 minutes
      if (diff > maxSleep) diff = maxSleep;
      console.log(`sleeping for ${diff / 60000} minutes`);
      setTimeout(downloadInput, diff);
    }
    const ws = fs.createWriteStream(`${sday}/input`, { flags: "w" });
    res.on("data", (chunk) => {
      process.stdout.write(chunk);
      ws.write(chunk);
    });
    res.on("end", () => {
      ws.close();
    });
  });

  req.end();
}

downloadInput();
