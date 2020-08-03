const express = require('express')
const { getRepoInfo } = require('../services/parseService')

const { validateRepoUrl } = require('../middlewares')

// import Router and apply middleware for this specific router
const router = express.Router()
router.use('/repo-count-lines', validateRepoUrl)

router.get('/repo-count-lines', async (req, res) => {
  const { repo } = req.query

  const result = await getRepoInfo(repo)

  res.json(result)
})

module.exports = router
