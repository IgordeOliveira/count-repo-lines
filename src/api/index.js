const express = require('express');
const axios = require('axios');
const { validateRepoUrl } = require('../middlewares')

const router = express.Router();

router.use('/repo-count-lines', validateRepoUrl)

router.get('/repo-count-lines', async (req, res) => {
  const { repo } = req.query;

  const repoHtml = await axios.get(repo)

  res.json({
    message: repo
  });
});

module.exports = router;
