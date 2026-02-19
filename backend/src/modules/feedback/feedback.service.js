const { query } = require('../../lib/db');

async function createFeedback(input) {
  const { user_id, type, message, allow_reply, images } = input;

  const { rows } = await query(
    `INSERT INTO public.feedback (user_id, type, message, images, allow_reply)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [user_id, type, message, images || null, allow_reply]
  );

  return { id: rows[0].id };
}

module.exports = {
  createFeedback,
};
