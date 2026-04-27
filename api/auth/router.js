const express = require('express');
const router = express.Router();
const {
  auth,
  check,
  checkExists,
  createAccount,
  login,
  accountInfo,
  updateAccountInfo
} = require('./controller');

// Public routes
router.post('/exists', checkExists);
router.post('/login', login);
router.post('/create', auth, createAccount);

// Protected routes
router.get('/check', auth, check);
router.get('/account', auth, accountInfo);
router.patch('/account', auth, updateAccountInfo);

module.exports = router;