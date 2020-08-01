const express = require('express');
const { client } = require('../services/httpService')
const { parseListFiles } = require('../services/parseService')
const { validateRepoUrl } = require('../middlewares')

// import Router and apply middleware for this specific router
const router = express.Router();
router.use('/repo-count-lines', validateRepoUrl)

async function getFoldersFiles(folders) {
  await Promise.all(folders.map((folder) => client.get(folder.href)))
    .then((responses) => {
      responses.map((response) => parseListFiles(response.data))
    });
}

async function getAllFiles(url) {
  const repoRawHtml = await client.get(url).then((response) => response.data)
  const items = parseListFiles(repoRawHtml)
  const files = []
  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    if (item.isFolder) {
      // eslint-disable-next-line no-await-in-loop
      const itensFromFolder = await getAllFiles(item.href)
      files.push({ [item.name]: itensFromFolder })
    } else {
      files.push(item)
    }
  }
  return files
}

router.get('/repo-count-lines', async (req, res) => {
  const { repo } = req.query;

  const files = await getAllFiles(repo)

  res.json({
    files
  });
});

module.exports = router;
