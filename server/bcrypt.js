const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 12;
const plaintext = "@268296";

console.time();
const hashed = bcrypt.hashSync(plaintext, SALT_ROUNDS);
console.timeEnd();

console.time();
const passwordMatch = bcrypt.compareSync(plaintext, hashed);
console.timeEnd();

console.log(hashed);
console.log(passwordMatch);
