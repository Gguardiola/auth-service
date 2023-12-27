const db = require('./db');

const checkIfUserExists = async (email) => {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result;
};

const checkIfUserTokenBlacklisted = async (token) => {
  const result = await db.query('SELECT * FROM token_blacklist WHERE token = $1', [token]);
  return result;
}

const insertUser = async (email, hashedPassword) => {
  await db.query('INSERT INTO users (email, username, lastname, password, birthday) VALUES ($1, $2, $3, $4, $5)', [email, hashedPassword, 'Pep','Pepin','1990-01-01']);
};

const updateUser = async (email, hashedPassword) => {
  await db.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashedPassword]);
};

const loginUser = async (email, hashedPassword) => {
  await db.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashedPassword]);
};

const logoutUser = async (token) => {
  await db.query('INSERT INTO token_blacklist (token) VALUES ($1)', [token]);
  
};

module.exports = {
  checkIfUserExists,
  insertUser,
  logoutUser,
  checkIfUserTokenBlacklisted,
  
};