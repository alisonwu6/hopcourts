const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager')

const REGION = process.env.AWS_REGION || 'ap-southeast-2'
const client = new SecretsManagerClient({ region: REGION })

async function getSecret(secretName) {
  const command = new GetSecretValueCommand({ SecretId: secretName })
  const response = await client.send(command)
  if ('SecretString' in response) {
    return JSON.parse(response.SecretString)
  }
  throw new Error('Secret not found or invalid format')
}

module.exports = { getSecret }
