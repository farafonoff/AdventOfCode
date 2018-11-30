const fs = require('fs');

var contents = fs.readFileSync('input', 'utf8').split("\n");
///*Vixen can fly 19 km/s for 7 seconds, but then must rest for 124 seconds.*/
var regex = /^([a-z]+) can fly ([0-9]+) km\/s for ([0-9]+) seconds, but then must rest for ([0-9]+) seconds\.$/i

var deers = []

var deers = contents.map(str=>{
  var match = str.match(regex); 
  if (match!=null) {
    return { name: match[1], speed: Number(match[2]), run: Number(match[3]), rest: Number(match[4]), path: 0, time:0, rest_time: 0, run_time: 0, points: 0 }
  } else {
    console.log(str);
  }
}).filter(deer=>deer!=null);

function run(time) {
  var has_deers;
  do {
    has_deers = false;
    deers.forEach(deer=> {
      var run_time = time-deer.time;
      if (run_time>deer.run) {
        run_time=deer.run;
      }
      if (run_time>0) {
        deer.path+=run_time*deer.speed;
        deer.time+=run_time;
        has_deers = true;
      }
      deer.time+=deer.rest;
    });
  } while (has_deers);
  deers = deers.sort((d1,d2) => d2.path-d1.path)
}

function run2(time) {
  var has_deers;
  for(var ti=0;ti<time;++ti) {
    has_deers = false;
    deers.forEach(deer=> {
      if (deer.run_time<deer.run) {
        deer.path+=deer.speed;
        deer.run_time+=1;
      } else if (deer.rest_time<deer.rest) {
        deer.rest_time+=1;
      } else {
        deer.rest_time=0;
        deer.run_time=1;
        deer.path+=deer.speed;
      }
    });
    deers = deers.sort((d1,d2) => d2.path-d1.path);
    deers[0].points+=1;
    for(var di=1;di<deers.length;++di) {
      if (deers[di].path==deers[0].path) {
        deers[di].points+=1;
      }
    }
  }
}

run2(2503);
console.log(deers);
console.log(deers[0].path);
deers.sort((d1,d2) => d2.points-d1.points);
console.log(deers[0].points);

