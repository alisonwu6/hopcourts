const { query } = require('../../../db/client');

exports.createFeedback = async (req, res, next) => {
  try {
    const { type, message, page, contact_email, allow_reply, meta } = req.body;
    // req.user is populated by auth middleware.
    // user_id can be null if we allow anonymous, but for now we use req.user.id if available.
    // If authenticated, use ID. If not, null.
    const user_id = req.user ? req.user.id : null;

    const { rows } = await query(
      `INSERT INTO public.feedback (user_id, type, message, page, contact_email, allow_reply, meta)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [user_id, type, message, page, contact_email, allow_reply, meta || {}]
    );

    res.status(201).json({ success: true, id: rows[0].id });
  } catch (err) {
    next(err);
  }
};
