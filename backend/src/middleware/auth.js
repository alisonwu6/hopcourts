// Cognito JWT verifier middleware (stateless)
const { CognitoJwtVerifier } = require('aws-jwt-verify')
require('dotenv').config()

const REGION = process.env.AWS_REGION || process.env.REGION || 'ap-southeast-2'
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID
const CLIENT_ID = process.env.COGNITO_CLIENT_ID

if (!USER_POOL_ID) console.warn('[auth] Missing COGNITO_USER_POOL_ID')
if (!CLIENT_ID) console.warn('[auth] Missing COGNITO_CLIENT_ID')

const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: 'access',
  clientId: CLIENT_ID,
})

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Missing Bearer token' })
    const payload = await verifier.verify(token)
    req.user = payload
    return next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = auth