const feedbackService = require('./feedback.service');

exports.createFeedback = async (req, res, next) => {
  try {
    const { type, message, page, contact_email, allow_reply, meta } = req.body;
    // req.user is populated by auth middleware.
    // user_id can be null if we allow anonymous, but for now we use req.user.id if available.
    // If authenticated, use ID. If not, null.
    const user_id = req.user ? req.user.id : null;

    const result = await feedbackService.createFeedback({
      user_id,
      type,
      message,
      page,
      contact_email,
      allow_reply,
      meta,
    });

    res.status(201).json({ success: true, id: result.id });
  } catch (err) {
    next(err);
  }
};
