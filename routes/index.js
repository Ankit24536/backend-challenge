const express = require('express');
const collectionsRoutes = require('./collections');

const router = express.Router();

router.use('/', collectionsRoutes);

module.exports = router;
