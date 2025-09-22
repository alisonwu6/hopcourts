// Cognito JWT verifier middleware (stateless)
require('dotenv').config()
const { CognitoJwtVerifier } = require('aws-jwt-verify')

const REGION = process.env.AWS_REGION || process.env.REGION || 'ap-southeast-2'
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || process.env.USER_POOL_ID
const CLIENT_ID = process.env.COGNITO_CLIENT_ID

if (!USER_POOL_ID) console.warn('[auth] Missing COGNITO_USER_POOL_ID in env')
if (!CLIENT_ID) console.warn('[auth] Missing COGNITO_CLIENT_ID in env')

// verify ACCESS tokens by default
const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  clientId: CLIENT_ID,
  tokenUse: 'access',
})

async function verifyToken(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ message: 'Token missing' })

    const payload = await verifier.verify(token, { currentDate: new Date() })
    // attach Cognito claims to req.user for downstream handlers
    req.user = payload
    return next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

module.exports = verifyToken
