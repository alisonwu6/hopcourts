const {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} = require('@aws-sdk/client-sqs')

// ---- env var ----
const {
  QUEUE_URL,
  AWS_REGION = 'ap-southeast-2',
  WAIT_TIME_SECONDS = '20',
  BATCH_SIZE = '1',
  VISIBILITY_TIMEOUT = '60',
} = process.env

if (!QUEUE_URL) {
  console.error('[worker] => Missing QUEUE_URL environment variable')
  process.exit(1)
}

const sqs = new SQSClient({ region: AWS_REGION })
let running = true

process.on('SIGTERM', () => {
  console.log('[worker] => Received SIGTERM — shutting down gracefully...')
  running = false
})
process.on('SIGINT', () => {
  console.log('[worker] => Received SIGINT — shutting down gracefully...')
  running = false
})

console.log('[worker] => Started. Polling queue:', QUEUE_URL)

async function handleMessage(msg) {
  console.log('[worker] => Processing message:', msg.MessageId)
  try {
    await new Promise((r) => setTimeout(r, 2000))
    console.log('[worker] => Done:', msg.MessageId)
  } catch (err) {
    console.error('[worker] ❗ Task error:', err.message)
  }
}

async function pollLoop() {
  while (running) {
    try {
      const res = await sqs.send(
        new ReceiveMessageCommand({
          QueueUrl: QUEUE_URL,
          MaxNumberOfMessages: Number(BATCH_SIZE),
          WaitTimeSeconds: Number(WAIT_TIME_SECONDS),
          VisibilityTimeout: Number(VISIBILITY_TIMEOUT),
        })
      )

      const messages = res.Messages || []
      if (messages.length === 0) {
        continue
      }

      for (const msg of messages) {
        await handleMessage(msg)

        await sqs.send(
          new DeleteMessageCommand({
            QueueUrl: QUEUE_URL,
            ReceiptHandle: msg.ReceiptHandle,
          })
        )
      }
    } catch (err) {
      console.error('[worker] Polling error:', err.message)
      await new Promise((r) => setTimeout(r, 5000))
    }
  }

  console.log('[worker] =>  Stopped polling loop.')
}

pollLoop().catch((err) => {
  console.error('[worker] => Fatal error:', err.message)
  process.exit(1)
})
