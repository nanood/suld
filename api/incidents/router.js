const express = require('express');
const router  = express.Router();
const { auth } = require('../auth/controller');
const { createIncident, getAllIncidents, updateIncident, deleteIncident } = require('./controller');

router.get('/',      auth, getAllIncidents);
router.post('/',     auth, createIncident);
router.put('/:id',   auth, updateIncident);
router.delete('/:id',auth, deleteIncident);

module.exports = router;
