const {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
} = require('@aws-sdk/client-dynamodb')

const REGION = process.env.AWS_REGION || 'ap-southeast-2'
// override by setting DDB_TABLE in .env
const TABLE = process.env.DDB_TABLE || 'ssm_dynamo_users_matches'

const ddb = new DynamoDBClient({ region: REGION })

// helper - convert DynamoDB AttributeValue map to plain JS object
function fromItem(item) {
  if (!item) return null
  const out = {}
  for (const [k, v] of Object.entries(item)) {
    if (v.S !== undefined) out[k] = v.S
    else if (v.N !== undefined) out[k] = Number(v.N)
    else if (v.BOOL !== undefined) out[k] = !!v.BOOL
    else out[k] = v
  }
  return out
}

async function putAvatarMeta({ userId, key, contentType }) {
  if (!userId || !key) return
  const now = Date.now()
  const cmd = new PutItemCommand({
    TableName: TABLE,
    Item: {
      userId: { S: String(userId) },
      s3Key: { S: String(key) },
      contentType: { S: String(contentType || '') },
      updatedAt: { N: String(now) },
    },
  })
  await ddb.send(cmd)
  return { ok: true, userId, key, updatedAt: now }
}

async function getAvatarMeta(userId) {
  const cmd = new GetItemCommand({
    TableName: TABLE,
    Key: { userId: { S: String(userId) } },
  })
  const res = await ddb.send(cmd)
  return fromItem(res.Item)
}

module.exports = { putAvatarMeta, getAvatarMeta, TABLE }
