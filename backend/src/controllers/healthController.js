export const getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'PlacementOS backend is running',
    timestamp: new Date().toISOString(),
  })
}