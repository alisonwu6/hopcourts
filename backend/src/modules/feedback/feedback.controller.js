const feedbackService = require('./feedback.service');

exports.createFeedback = async (req, res, next) => {
  try {
    const { type, message, allow_reply, images, guest_email } = req.body;
    const user_id = req.user ? req.user.id : null;

    const result = await feedbackService.createFeedback({
      user_id,
      type,
      message,
      allow_reply,
      images,
      guest_email: user_id ? null : (guest_email || null),
    });

    res.status(201).json({ success: true, id: result.id });
  } catch (err) {
    next(err);
  }
};
