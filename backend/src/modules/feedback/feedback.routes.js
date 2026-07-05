const express = require('express');
const router = express.Router();
const controller = require('./feedback.controller');
const { optionalAuth } = require('../../middleware/verifyToken');

// POST /api/v1/feedback - Create new feedback
router.post('/', optionalAuth, controller.createFeedback);

module.exports = { feedbackRouter: router };
