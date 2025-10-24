import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/media/health', (req, res) => res.status(200).send('media ok'))

app.post('/media/process', (req, res) => {
  console.log('[MEDIA] validating upload...')
  setTimeout(() => console.log('[MEDIA] validation done'), 2000)
  res.status(202).send('accepted')
})

app.listen(3000, '0.0.0.0', () => console.log('[MEDIA] up on 3000'))
