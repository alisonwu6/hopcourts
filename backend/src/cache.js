const Redis = require('ioredis')

const HOST = process.env.REDIS_HOST
const PORT = Number(process.env.REDIS_PORT || 6379)
const USE_TLS = String(process.env.REDIS_TLS || '0') === '1'
const IS_CLUSTER =
  String(process.env.REDIS_MODE || '').toLowerCase() === 'cluster'

let redis

if (IS_CLUSTER) {
  // Cluster mode + TLS
  redis = new Redis.Cluster([{ host: HOST, port: PORT }], {
    // Avoid reverse lookups that sometimes break in private VPCs
    dnsLookup: (address, cb) => cb(null, address),
    redisOptions: USE_TLS ? { tls: { servername: HOST } } : {},
  })
} else {
  // Single node for dev/local
  redis = new Redis({
    host: HOST,
    port: PORT,
    ...(USE_TLS ? { tls: { servername: HOST } } : {}),
  })
}

async function getCache(key) {
  const val = await redis.get(key)
  return val ? JSON.parse(val) : null
}
async function setCache(key, value, ttlSeconds = 60) {
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
}
async function delCache(key) {
  await redis.del(key)
}

module.exports = { redis, getCache, setCache, delCache }
