//You got rank 114

const fs = require('fs');

var contents = fs.readFileSync('input', 'utf8').split("\n");

function aba(st) {
	var res = []
	for(var i = 2;i<st.length;++i) {
		var c0 = st.charAt(i-2);
		var c1 = st.charAt(i-1);
		var c2 = st.charAt(i);
		if (c0==c2&&c1!=c2) {
			res.push([c0,c1,c2].join(''));
		}		
	}
	return res;
}

function check(str) {
	var parts = str.split('[');
	var res1 = false;
	var res2 = false;
	var abas = [];
	abas = abas.concat(aba(parts[0]))
	for (var i = 1;i<parts.length;++i) {
		var pp = parts[i].split(']');
		abas = abas.concat(aba(parts[1]))
	}
	
	var result = false;
	for (var i = 1;i<parts.length;++i) {
		var pp = parts[i].split(']');
		abas.forEach(ab=>{
			var bab = [ab.charAt(1), ab.charAt(0), ab.charAt(1)].join('');
			if (pp[0].indexOf(bab)!=-1) {
				result = true;
			}
		});		
	}	

	return result;
}

console.log(check('aba[bab]xyz'));
console.log(check('xyx[xyx]xyx'));
console.log(check('zazbz[bzb]cdb'));
console.log(check('aaaa[qwer]tyui'));	
console.log(contents.filter(check).length)
