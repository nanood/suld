const db = require('../db');

const getAllBranches = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id, b_name, b_address, b_location, b_front_img64, b_contact,
             b_plan_base64, b_device_id, b_assemble_engineers, b_code_user_id, b_create_time
      FROM branches ORDER BY b_name ASC
    `);
    res.json({ success: 1, data: rows });
  } catch (err) {
    console.error('getAllBranches:', err);
    res.status(500).json({ success: 0, message: 'Салбар татахад алдаа гарлаа' });
  }
};

const getBranchById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query(`
      SELECT id, b_name, b_address, b_location, b_front_img64, b_contact,
             b_plan_base64, b_device_id, b_assemble_engineers, b_code_user_id, b_create_time
      FROM branches WHERE id = $1
    `, [id]);
    if (!rows.length) return res.status(404).json({ success: 0, message: 'Салбар олдсонгүй' });
    res.json({ success: 1, data: rows[0] });
  } catch (err) {
    console.error('getBranchById:', err);
    res.status(500).json({ success: 0, message: 'Салбарын мэдээлэл татахад алдаа гарлаа' });
  }
};

const createBranch = async (req, res) => {
  const { b_name, b_address, b_location, b_contact, b_device_id,
          b_assemble_engineers, b_code_user_id, b_front_img64, b_plan_base64 } = req.body;

  if (!b_name || !b_name.trim()) {
    return res.status(400).json({ success: 0, message: 'Салбарын нэр заавал шаардлагатай' });
  }

  try {
    const { rows } = await db.query(`
      INSERT INTO branches
        (b_name, b_address, b_location, b_contact, b_device_id,
         b_assemble_engineers, b_code_user_id, b_front_img64, b_plan_base64, b_create_time)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, NOW())
      RETURNING id
    `, [
      b_name.trim(), b_address || null, b_location || null, b_contact || null,
      b_device_id || null, b_assemble_engineers || null,
      b_code_user_id ? parseInt(b_code_user_id) : null,
      b_front_img64 || null, b_plan_base64 || null
    ]);
    res.status(201).json({ success: 1, data: { id: rows[0].id } });
  } catch (err) {
    console.error('createBranch:', err);
    res.status(500).json({ success: 0, message: 'Салбар үүсгэхэд алдаа гарлаа' });
  }
};

const updateBranch = async (req, res) => {
  const { id } = req.params;
  const allowed = ['b_name','b_address','b_location','b_contact','b_device_id',
                   'b_assemble_engineers','b_code_user_id','b_front_img64','b_plan_base64'];

  const updates = {};
  for (const key of allowed) {
    if (key in req.body) updates[key] = req.body[key];
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ success: 0, message: 'Шинэчлэх мэдээлэл байхгүй' });
  }

  const keys = Object.keys(updates);
  const vals = Object.values(updates);
  const set  = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');

  try {
    const { rowCount } = await db.query(
      `UPDATE branches SET ${set} WHERE id = $${keys.length + 1}`,
      [...vals, id]
    );
    if (!rowCount) return res.status(404).json({ success: 0, message: 'Салбар олдсонгүй' });
    res.json({ success: 1 });
  } catch (err) {
    console.error('updateBranch:', err);
    res.status(500).json({ success: 0, message: 'Салбар засахад алдаа гарлаа' });
  }
};

const deleteBranch = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM branches WHERE id = $1', [id]);
    if (!rowCount) return res.status(404).json({ success: 0, message: 'Салбар олдсонгүй' });
    res.json({ success: 1 });
  } catch (err) {
    console.error('deleteBranch:', err);
    res.status(500).json({ success: 0, message: 'Салбар устгахад алдаа гарлаа' });
  }
};

module.exports = { getAllBranches, getBranchById, createBranch, updateBranch, deleteBranch };
