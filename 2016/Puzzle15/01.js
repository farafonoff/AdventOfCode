//You got rank 222
//You got rank 226

const fs = require('fs');
const HM = require('hashmap');

function solve(part) {
	var contents = fs.readFileSync('input', 'utf8').split("\n")
	.map(str=>str.match(/Disc #\d+ has (\d+) positions; at time=0, it is at position (\d+)./))
	.filter(v=>!!v);
	if (part==2) 
		contents = contents.concat([[0,11,0]])
	contents = contents.map((arr,idx)=>[Number(arr[1]), Number(arr[2]), (Number(arr[2])+idx+1)%Number(arr[1])]);

	/*contents = contents.map((disk, idx)=>{
		disk.push(disk[0]-idx-1)
	})*/
	var disks = contents;

	//console.log(disks);

	var step = 1;
	var pos = 0;

	for(var i=0;i<disks.length;++i) {
		while ((disks[i][2]+pos)%disks[i][0]!=0) {
			pos+=step;
		}
		step *= disks[i][0];
		//console.log(pos, step);
	}

	return pos;
}
console.log(solve(1));
console.log(solve(2));

//console.log(contents);

