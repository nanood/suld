const express = require('express');
const router  = express.Router();
const { auth } = require('../auth/controller');
const { getAllBranches, getBranchById, createBranch, updateBranch, deleteBranch } = require('./controller');

router.get('/',      getAllBranches);
router.get('/:id',   getBranchById);
router.post('/',     auth, createBranch);
router.put('/:id',   auth, updateBranch);
router.delete('/:id',auth, deleteBranch);

module.exports = router;
