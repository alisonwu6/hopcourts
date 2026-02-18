const { query } = require('../../lib/db');

async function createFeedback(input) {
  const { user_id, type, message, page, contact_email, allow_reply, meta } = input;

  const { rows } = await query(
    `INSERT INTO public.feedback (user_id, type, message, page, contact_email, allow_reply, meta)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [user_id, type, message, page, contact_email, allow_reply, meta || {}]
  );

  return { id: rows[0].id };
}

module.exports = {
  createFeedback,
};
