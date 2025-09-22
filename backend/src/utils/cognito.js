const crypto = require('crypto')
require('dotenv').config()
const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
} = require('@aws-sdk/client-cognito-identity-provider')

const REGION = process.env.AWS_REGION || process.env.REGION || 'ap-southeast-2'
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID
const COGNITO_CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET

if (!COGNITO_CLIENT_ID) console.warn('[cognito] Missing COGNITO_CLIENT_ID in env')
if (!COGNITO_CLIENT_SECRET) console.warn('[cognito] Using client WITH secret per course demo; set COGNITO_CLIENT_SECRET')

const client = new CognitoIdentityProviderClient({ region: REGION })

function secretHash(username) {
  // HMAC-SHA256(clientSecret, username + clientId), base64-encoded
  if (!COGNITO_CLIENT_SECRET) return undefined
  const hmac = crypto.createHmac('sha256', COGNITO_CLIENT_SECRET)
  hmac.update(username + COGNITO_CLIENT_ID)
  return hmac.digest('base64')
}

async function signUpUser({ username, email, password }) {
  const user = username || email
  const input = {
    ClientId: COGNITO_CLIENT_ID,
    Username: user,
    Password: password,
    UserAttributes: [{ Name: 'email', Value: email }],
  }
  const sh = secretHash(user)
  if (sh) input.SecretHash = sh
  const cmd = new SignUpCommand(input)
  return client.send(cmd)
}

async function confirmUser({ username, code }) {
  const user = username
  const input = {
    ClientId: COGNITO_CLIENT_ID,
    Username: user,
    ConfirmationCode: code,
  }
  const sh = secretHash(user)
  if (sh) input.SecretHash = sh
  const cmd = new ConfirmSignUpCommand(input)
  return client.send(cmd)
}

async function loginUser({ username, password }) {
  const authParameters = { USERNAME: username, PASSWORD: password }
  const sh = secretHash(username)
  if (sh) authParameters.SECRET_HASH = sh
  const cmd = new InitiateAuthCommand({
    ClientId: COGNITO_CLIENT_ID,
    AuthFlow: 'USER_PASSWORD_AUTH',
    AuthParameters: authParameters,
  })
  const res = await client.send(cmd)
  const { AccessToken, IdToken, RefreshToken } = res.AuthenticationResult || {}
  return { accessToken: AccessToken, idToken: IdToken, refreshToken: RefreshToken }
}

module.exports = { signUpUser, confirmUser, loginUser }