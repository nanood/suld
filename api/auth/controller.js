const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const SALT_ROUNDS = 10;

// JWT шалгах middleware
function auth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: 0, message: 'token байхгүй' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: 0, message: 'token хүчингүй' });
        }
        req.user = decoded;     // req.data биш req.user гэж нэрлэх нь илүү түгээмэл
        next();
    });
}

// token шалгах тест endpoint
const check = (req, res) => {
    return res.json({
        success: 1,
        data: req.user,
    });
};

// username байгаа эсэх шалгах
const checkExists = async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT COUNT(*)::int AS cnt FROM users WHERE LOWER(username) = LOWER($1)',
            [req.body.username]
        );

        return res.json({
            success: rows[0].cnt > 0 ? 1 : 0,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: 0, message: err.message });
    }
};

// Шинэ хэрэглэгч бүртгэх
const createAccount = async (req, res) => {
    const { fname, lname = '', username, password, division = 0 } = req.body;

    // ... бусад шалгалт

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        await db.query(
            `INSERT INTO users (username, password, fname, lname, created_at, division)
             VALUES (LOWER($1), $2, $3, $4, NOW(), $5)`,
            [username, hashedPassword, fname.trim(), lname.trim(), division]
        );

        // ... үлдсэн хэсэг (token үүсгэх гэх мэт)
    } catch (err) {
        // ...
    }
};

// Нэвтрэх
const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ success: 0, message: 'username эсвэл password оруулаагүй' });
    }

    try {
        const { rows } = await db.query(
            `SELECT id, username, password, fname, division
             FROM users
             WHERE LOWER(username) = LOWER($1)`,
            [username]
        );

        if (rows.length === 0) {
            return res.json({ success: 0, message: 'Хэрэглэгч олдсонгүй' });
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.json({ success: 0, message: 'Нууц үг буруу' });
        }

        const accessToken = jwt.sign(
            { username: user.username, id: user.id },
            process.env.ACCESS_TOKEN
        );

        return res.json({
            success: 1,
            username: user.username,
            fname: user.fname,
            division: user.division,
            accessToken,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: 0, message: err.message });
    }
};

// Өөрийн мэдээлэл харах
const accountInfo = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, username, fname, lname, created_at, division
       FROM users
       WHERE username = $1`,
      [req.user.username]
    );

    if (rows.length === 0) {
      return res.json({ success: 0, message: 'Хэрэглэгч олдсонгүй' });
    }

    res.json({ success: 1, data: rows[0] });   // division энд байх ёстой
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: err.message });
  }
};

// Мэдээлэл шинэчлэх (fname, lname)
const updateAccountInfo = async (req, res) => {
    const { fname, lname } = req.body;

    try {
        await db.query(
            `UPDATE users
             SET fname = COALESCE($1, fname),
                 lname = COALESCE($2, lname)
             WHERE username = $3`,
            [fname?.trim() || null, lname?.trim() || null, req.user.username]
        );

        return res.json({ success: 1 });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: 0, message: err.message });
    }
};

module.exports = {
  auth,
  check,
  checkExists,
  createAccount,
  login,
  accountInfo,
  updateAccountInfo,
};