import express from 'express'
import cors from 'cors'

import healthRoutes from './routes/healthRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import opportunityRoutes from './routes/opportunityRoutes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/health', healthRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/opportunities', opportunityRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`PlacementOS backend running on http://localhost:${PORT}`)
})