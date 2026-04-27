const db = require('../db');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const create = async (req, res) => {
  const { fname, lname = '', username, password, division = 0, avatar = null } = req.body;

  if (!username || !password || !fname)
    return res.status(400).json({ success: 0, message: 'username, password, fname шаардлагатай' });
  if (username.trim().length < 3)
    return res.status(400).json({ success: 0, message: 'Username хамгийн багадаа 3 тэмдэгт байх ёстой' });
  if (password.length < 6)
    return res.status(400).json({ success: 0, message: 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой' });

  try {
    const { rows: existing } = await db.query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [username.trim()]
    );
    if (existing.length)
      return res.status(409).json({ success: 0, message: 'Энэ username аль хэдийн ашиглагдаж байна' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await db.query(
      `INSERT INTO users (username, password, fname, lname, avatar, created_at, division)
       VALUES (LOWER($1), $2, $3, $4, $5, NOW(), $6)
       RETURNING id, username, fname, lname, division, created_at`,
      [username.trim(), hashed, fname.trim(), lname.trim(), avatar, division]
    );
    res.status(201).json({ success: 1, message: 'Хэрэглэгч амжилттай үүсгэгдлээ', user: rows[0] });
  } catch (err) {
    console.error('create user:', err);
    res.status(500).json({ success: 0, message: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, username, fname, lname, division, created_at FROM users ORDER BY created_at DESC`
    );
    res.json({ success: 1, users: rows });
  } catch (err) {
    console.error('getAll users:', err);
    res.status(500).json({ success: 0, message: err.message });
  }
};

const getById = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id)))
    return res.status(400).json({ success: 0, message: 'id буруу байна' });

  try {
    const { rows } = await db.query(
      `SELECT id, username, fname, lname, division, created_at FROM users WHERE id = $1`,
      [parseInt(id)]
    );
    if (!rows.length) return res.status(404).json({ success: 0, message: 'Хэрэглэгч олдсонгүй' });
    res.json({ success: 1, user: rows[0] });
  } catch (err) {
    console.error('getById:', err);
    res.status(500).json({ success: 0, message: err.message });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id)))
    return res.status(400).json({ success: 0, message: 'id буруу байна' });

  const { fname, lname, division, password } = req.body;

  try {
    if (password && password.length < 6)
      return res.status(400).json({ success: 0, message: 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой' });

    let query, params;
    if (password) {
      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      query  = `UPDATE users SET fname = COALESCE($1, fname), lname = COALESCE($2, lname), division = COALESCE($3, division), password = $4 WHERE id = $5`;
      params = [fname || null, lname ?? null, division ?? null, hashed, parseInt(id)];
    } else {
      query  = `UPDATE users SET fname = COALESCE($1, fname), lname = COALESCE($2, lname), division = COALESCE($3, division) WHERE id = $4`;
      params = [fname || null, lname ?? null, division ?? null, parseInt(id)];
    }

    const { rowCount } = await db.query(query, params);
    if (!rowCount) return res.status(404).json({ success: 0, message: 'Хэрэглэгч олдсонгүй' });
    res.json({ success: 1 });
  } catch (err) {
    console.error('update user:', err);
    res.status(500).json({ success: 0, message: err.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id)))
    return res.status(400).json({ success: 0, message: 'id буруу байна' });

  try {
    const { rowCount } = await db.query('DELETE FROM users WHERE id = $1', [parseInt(id)]);
    if (!rowCount) return res.status(404).json({ success: 0, message: 'Хэрэглэгч олдсонгүй' });
    res.json({ success: 1 });
  } catch (err) {
    console.error('deleteUser:', err);
    res.status(500).json({ success: 0, message: err.message });
  }
};

module.exports = { create, getAll, getById, update, deleteUser };
