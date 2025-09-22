// AWS Parameter Store
require('dotenv').config()
const {
  SSMClient,
  GetParameterCommand,
  GetParametersByPathCommand,
} = require('@aws-sdk/client-ssm')

const REGION = process.env.AWS_REGION || process.env.REGION || 'ap-southeast-2'
const ssm = new SSMClient({ region: REGION })

// in-process cache
const cache = new Map()
const DEFAULT_TTL_MS = 60 * 1000

function setCache(key, value, ttlMs = DEFAULT_TTL_MS) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs })
}
function getCache(key) {
  const hit = cache.get(key)
  if (!hit) return undefined
  if (Date.now() > hit.expiresAt) {
    cache.delete(key)
    return undefined
  }
  return hit.value
}

async function getParam(
  name,
  { withDecryption = false, ttlMs = DEFAULT_TTL_MS } = {}
) {
  const cacheKey = `param:${name}:${withDecryption}`
  const memo = getCache(cacheKey)
  if (memo !== undefined) return memo

  const cmd = new GetParameterCommand({
    Name: name,
    WithDecryption: withDecryption,
  })
  const res = await ssm.send(cmd)
  const val = res?.Parameter?.Value
  setCache(cacheKey, val, ttlMs)
  return val
}

module.exports = { getParam }
