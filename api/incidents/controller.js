const db = require('../db');

const toBool = (v) => v === true || v === 1 || v === 'true' || v === '1';

const createIncident = async (req, res) => {
  const {
    branch_id, incident_date, call_received_time,
    is_drunk, is_theft, is_traffic, is_phone,
    is_water_alarm, is_police, is_other,
    action_description, response_time_minutes
  } = req.body;

  if (!branch_id) return res.status(400).json({ success: 0, message: 'branch_id заавал шаардлагатай' });
  if (isNaN(parseInt(branch_id))) return res.status(400).json({ success: 0, message: 'branch_id буруу байна' });
  if (response_time_minutes !== undefined && response_time_minutes !== null) {
    if (isNaN(Number(response_time_minutes)) || Number(response_time_minutes) < 0)
      return res.status(400).json({ success: 0, message: 'response_time_minutes буруу утга байна' });
  }

  try {
    const { rows: bc } = await db.query('SELECT id FROM branches WHERE id = $1', [parseInt(branch_id)]);
    if (!bc.length) return res.status(404).json({ success: 0, message: 'Салбар олдсонгүй' });

    const { rows } = await db.query(`
      INSERT INTO incidents (
        branch_id, incident_date, call_received_time,
        is_drunk, is_theft, is_traffic, is_phone,
        is_water_alarm, is_police, is_other,
        action_description, response_time_minutes, created_at
      ) VALUES (
        $1,
        COALESCE($2::date, CURRENT_DATE),
        COALESCE($3::time, CURRENT_TIME),
        $4,$5,$6,$7,$8,$9,$10,$11,$12, CURRENT_TIMESTAMP
      ) RETURNING id
    `, [
      parseInt(branch_id),
      incident_date || null, call_received_time || null,
      toBool(is_drunk), toBool(is_theft), toBool(is_traffic), toBool(is_phone),
      toBool(is_water_alarm), toBool(is_police), toBool(is_other),
      action_description?.trim() || null,
      response_time_minutes !== undefined ? Number(response_time_minutes) : null
    ]);
    res.status(201).json({ success: 1, data: { id: rows[0].id } });
  } catch (err) {
    console.error('createIncident:', err);
    res.status(500).json({ success: 0, message: 'Бүртгэхэд алдаа гарлаа' });
  }
};

const getAllIncidents = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id, branch_id, incident_date, call_received_time,
             is_drunk, is_theft, is_traffic, is_phone,
             is_water_alarm, is_police, is_other,
             action_description, response_time_minutes, created_at
      FROM incidents ORDER BY created_at DESC
    `);
    res.json({ success: 1, data: rows });
  } catch (err) {
    console.error('getAllIncidents:', err);
    res.status(500).json({ success: 0, message: 'Осол татахад алдаа гарлаа' });
  }
};

const updateIncident = async (req, res) => {
  const { id } = req.params;
  const {
    branch_id, incident_date, call_received_time,
    is_drunk, is_theft, is_traffic, is_phone,
    is_water_alarm, is_police, is_other,
    action_description, response_time_minutes
  } = req.body;

  try {
    const { rowCount } = await db.query(`
      UPDATE incidents SET
        branch_id             = COALESCE($1, branch_id),
        incident_date         = COALESCE($2::date, incident_date),
        call_received_time    = COALESCE($3::time, call_received_time),
        is_drunk              = $4,
        is_theft              = $5,
        is_traffic            = $6,
        is_phone              = $7,
        is_water_alarm        = $8,
        is_police             = $9,
        is_other              = $10,
        action_description    = $11,
        response_time_minutes = $12
      WHERE id = $13
    `, [
      branch_id ? parseInt(branch_id) : null,
      incident_date || null, call_received_time || null,
      toBool(is_drunk), toBool(is_theft), toBool(is_traffic), toBool(is_phone),
      toBool(is_water_alarm), toBool(is_police), toBool(is_other),
      action_description?.trim() ?? null,
      response_time_minutes !== undefined && response_time_minutes !== '' ? Number(response_time_minutes) : null,
      id
    ]);
    if (!rowCount) return res.status(404).json({ success: 0, message: 'Осол олдсонгүй' });
    res.json({ success: 1 });
  } catch (err) {
    console.error('updateIncident:', err);
    res.status(500).json({ success: 0, message: 'Засахад алдаа гарлаа' });
  }
};

const deleteIncident = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM incidents WHERE id = $1', [id]);
    if (!rowCount) return res.status(404).json({ success: 0, message: 'Осол олдсонгүй' });
    res.json({ success: 1 });
  } catch (err) {
    console.error('deleteIncident:', err);
    res.status(500).json({ success: 0, message: 'Устгахад алдаа гарлаа' });
  }
};

module.exports = { createIncident, getAllIncidents, updateIncident, deleteIncident };
