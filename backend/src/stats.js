import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/stats/health', (req, res) => res.status(200).send('stats ok'))

setInterval(() => {
  console.log('[STATS] recomputing aggregates...')
}, 5000)

app.listen(3000, '0.0.0.0', () => console.log('[STATS] up on 3000'))
