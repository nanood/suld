const express = require('express');
const router  = express.Router();
const { auth } = require('../auth/controller');
const { create, getAll, getById, update, deleteUser } = require('./controller');

router.post('/create',  create);
router.get('/',         auth, getAll);
router.get('/:id',      auth, getById);
router.put('/:id',      auth, update);
router.delete('/:id',   auth, deleteUser);

module.exports = router;
