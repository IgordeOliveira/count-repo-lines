const express = require('express');
const { client } = require('../services/httpService')
const { parseListFiles } = require('../services/parseService')
const { validateRepoUrl } = require('../middlewares')

// import Router and apply middleware for this specific router
const router = express.Router();
router.use('/repo-count-lines', validateRepoUrl)

router.get('/repo-count-lines', async (req, res) => {
  const { repo } = req.query;

  const repoHtml = await client.get(`${repo}`).then((response) => response.data)
  const result = parseListFiles(repoHtml)

  res.json({
    message: result
  });
});

module.exports = router;
