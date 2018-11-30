//You achieved rank 83

const fs = require('fs');

var contents = fs.readFileSync('input', 'utf8').split("\n");

function cp(st) {
	for(var i = 3;i<st.length;++i) {
		var c0 = st.charAt(i-3);
		var c1 = st.charAt(i-2);
		var c2 = st.charAt(i-1);
		var c3 = st.charAt(i);
		if (c0==c3&&c1==c2&&c2!=c3) {
			return true;
		}
	}
	return false;
}

function check(str) {
	var parts = str.split('[');
	var res1 = false;
	var res2 = false;
	if (cp(parts[0])) res1=true;
	for (var i = 1;i<parts.length;++i) {
		var pp = parts[i].split(']');
		if (cp(pp[0])) res2 = true;
		if (cp(pp[1])) res1 = true;
	}
	return res1&&(!res2);
}

console.log(check('abba[mnop]qrst'));
console.log(check('abcd[bddb]xyyx'));
console.log(check('ioxxoj[asdfgh]zxcvbn'));

console.log(contents.filter(check).length)
