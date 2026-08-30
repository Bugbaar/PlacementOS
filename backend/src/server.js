import express from 'express'
import cors from 'cors'

import healthRoutes from './routes/healthRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import opportunityRoutes from './routes/opportunityRoutes.js'
import matchRoutes from './routes/matchRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/health', healthRoutes)
app.use('/api/opportunities', opportunityRoutes)
app.use('/api', notificationRoutes)
app.use('/api/students', matchRoutes)
app.use('/api/students', studentRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`PlacementOS backend running on http://localhost:${PORT}`)
})