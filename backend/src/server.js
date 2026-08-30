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

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  })
})

app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Request body is not valid JSON',
      },
    })
    return
  }

  console.error(error)
  res.status(error.status || 500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong on the server',
    },
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`PlacementOS backend running on http://localhost:${PORT}`)
})