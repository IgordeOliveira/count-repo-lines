const express = require('express')

const { client } = require('../services/httpService')

const { parseListFiles, parseFile } = require('../services/parseService')
const { validateRepoUrl } = require('../middlewares')

// import Router and apply middleware for this specific router
const router = express.Router()
router.use('/repo-count-lines', validateRepoUrl)

async function getFileTree(url) {
  const repoRawHtml = await client.get(url).then((response) => response.data)
  const items = parseListFiles(repoRawHtml)

  const foldersPromises = items.filter((item) => item.isFolder)
    .map((folder) => getFileTree(folder.href)
      .then((files) => ({ [folder.name]: files })))

  const filesPromises = items.filter((item) => !item.isFolder)
    .map((file) => client.get(file.href)
      .then((response) => {
        const fileRawHtml = response.data
        const lineAndSize = parseFile(fileRawHtml)
        return { ...file, ...lineAndSize }
      }).catch((err) => ({ ...file, error: err.response.statusText })))

  let foldersFiles = await Promise.allSettled(foldersPromises)
  foldersFiles = foldersFiles.map((result) => (result.status === 'fulfilled' ? result.value : result.reason))

  let files = await Promise.allSettled(filesPromises)
  files = files.map((result) => (result.status === 'fulfilled' ? result.value : result.reason))

  return Object.assign(files, foldersFiles)
}

// function findAllByKey(obj, keyToFind) {
//   return Object.entries(obj)
//     .reduce((acc, [key, value]) => ((key === keyToFind)
//       ? acc.concat(value)
//       : (typeof value === 'object')
//         ? acc.concat(findAllByKey(value, keyToFind))
//         : acc),
//     [])
// }
//
// async function getAllFiles(fileTree) {
//   const links = findAllByKey(fileTree, 'href')
//   const filesPromises = links.map((link) => client.get(link).then((response) => response.data))
//   return Promise.all(filesPromises)
// }

router.get('/repo-count-lines', async (req, res) => {
  const { repo } = req.query

  const files = await getFileTree(repo)
  // files = await getAllFiles(files)
  // console.log(files[0])
  res.json(files)
})

module.exports = router
