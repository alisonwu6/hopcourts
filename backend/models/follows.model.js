const { query } = require('../db/client')

async function createFollow(followerId, followingId) {
  const sql = `
    insert into public.user_follows (follower_id, following_id)
    values ($1, $2)
    on conflict (follower_id, following_id) do nothing
  `
  await query(sql, [followerId, followingId])
}

async function removeFollow(followerId, followingId) {
  const sql = `
    delete from public.user_follows
    where follower_id = $1 and following_id = $2
  `
  await query(sql, [followerId, followingId])
}

async function isFollowing(followerId, followingId) {
  const sql = `
    select 1 from public.user_follows
    where follower_id = $1 and following_id = $2
  `
  const { rows } = await query(sql, [followerId, followingId])
  return rows.length > 0
}

async function getFollowerCount(userId) {
  const sql = `select count(*) from public.user_follows where following_id = $1`
  const { rows } = await query(sql, [userId])
  return parseInt(rows[0].count, 10)
}

async function getFollowingCount(userId) {
  const sql = `select count(*) from public.user_follows where follower_id = $1`
  const { rows } = await query(sql, [userId])
  return parseInt(rows[0].count, 10)
}

module.exports = {
  createFollow,
  removeFollow,
  isFollowing,
  getFollowerCount,
  getFollowingCount
}
