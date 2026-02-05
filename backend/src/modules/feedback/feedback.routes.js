const express = require('express');
const router = express.Router();
const controller = require('./feedback.controller');
const { verifyToken } = require('../../middleware/verifyToken');

// POST /api/v1/feedback - Create new feedback
router.post('/', verifyToken, controller.createFeedback);

module.exports = { feedbackRouter: router };
