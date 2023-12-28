const db = require('./db');

const checkIfUserExists = async (email) => {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result;
};

const checkIfUserTokenBlacklisted = async (token) => {
  const result = await db.query('SELECT * FROM token_blacklist WHERE token = $1', [token]);
  return result;
}

const insertUser = async (email, hashedPassword, username, lastname, birthday) => {
  await db.query('INSERT INTO users (email, username, lastname, password, birthday, image_name) VALUES ($1, $3, $4, $2, $5, $6)', [email, hashedPassword, username, lastname, birthday, 'default.png' ]);
};

const startSession = async (userId, token) => {
  await db.query('INSERT INTO user_sessions (user_id, token) VALUES ($1, $2)', [userId, token]);
};

const checkIfUserIsLogged = async (userId) => {
  const result = await db.query('SELECT * FROM user_sessions WHERE user_id = $1', [userId]);
  return result;
};

const checkIfUserIsLoggedByToken = async (token) => { 
  const result = await db.query('SELECT * FROM user_sessions WHERE token = $1', [token]);
  return result;
}

const logoutUser = async (token) => {
  await db.query('INSERT INTO token_blacklist (token) VALUES ($1)', [token]);
  await db.query('DELETE FROM user_sessions WHERE token = $1', [token]);
};

module.exports = {
  checkIfUserExists,
  insertUser,
  logoutUser,
  checkIfUserTokenBlacklisted,
  startSession,
  checkIfUserIsLogged,
  checkIfUserIsLoggedByToken,
  
};