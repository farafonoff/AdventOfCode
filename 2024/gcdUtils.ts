// Функция для нахождения НОД двух чисел
export function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

// Функция для нахождения НОД массива чисел
export function arrayGCD(arr) {
    let result = arr[0];
    for (let i = 1; i < arr.length; i++) {
        result = gcd(result, arr[i]);
    }
    return result;
}

// Функция для нахождения НОК двух чисел
export function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
}

// Функция для нахождения НОК массива чисел
export function arrayLCM(arr) {
    let result = arr[0];
    for (let i = 1; i < arr.length; i++) {
        result = lcm(result, arr[i]);
    }
    return result;
}

// Extended Euclidean Algorithm to find modular inverse
function modInverse(a, m) {
    let m0 = m;
    let x0 = 0;
    let x1 = 1;

    while (a > 1) {
        const q = Math.floor(a / m);
        let t = m;
        m = a % m;
        a = t;

        t = x0;
        x0 = x1 - q * x0;
        x1 = t;
    }

    return x1 < 0 ? x1 + m0 : x1;
}

// Chinese Remainder Theorem
function chineseRemainderTheorem(residues, moduli) {
    const product = moduli.reduce((acc, val) => acc * val, 1);
    let result = 0;

    for (let i = 0; i < residues.length; i++) {
        const bi = product / moduli[i];
        const biInverse = modInverse(bi, moduli[i]);
        result += residues[i] * bi * biInverse;
    }

    return result % product;
}

// Example usage
const residues = [2, 3, 2];
const moduli = [3, 5, 7];

const result = chineseRemainderTheorem(residues, moduli);
console.log("Solution:", result);