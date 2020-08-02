const cheerio = require('cheerio')
const flatMapDeep = require('lodash.flatmapdeep')
const groupBy = require('lodash.groupby')
const { client } = require('./httpService')

const parseListFiles = (repoHtml) => {
  const $ = cheerio.load(repoHtml)
  const files = $('.Box-row.js-navigation-item').map((index, element) => {
    const linkFile = $(element).find('a')
    const iconName = $(element).find('svg').attr('aria-label')
    const title = linkFile.attr('title')
    return {
      extension: title.split('.').pop(),
      name: title,
      href: linkFile.attr('href').replace('/blob', ''),
      isFolder: iconName === 'Directory'
    }
  })

  // returning with ToArray because cheerio returns an object of his "type"
  return files.toArray().filter((file) => file.name !== 'Go to parent directory')
}

const parseFile = (response) => ({
  lines: parseInt(response.headers['content-lines'], 10), // count lines of file
  bytes: parseInt(response.headers['content-length'], 10) // get bytes from header
})

async function getFileTree(url) {
  const repoRawHtml = await client.get(url).then((response) => response.data)
  const items = parseListFiles(repoRawHtml)

  const foldersPromises = items.filter((item) => item.isFolder)
    .map((folder) => getFileTree(folder.href)
      .then((files) => ({ [folder.name]: files })))

  const filesPromises = items.filter((item) => !item.isFolder)
    // get individual file
    .map((file) => client.get(`https://raw.githubusercontent.com${file.href}`)
      .then((response) => {
        const lineAndSize = parseFile(response)
        return { ...file, ...lineAndSize }
      }).catch((err) => ({ ...file, error: err.response.statusText || 'error' })))

  let foldersFiles = await Promise.allSettled(foldersPromises)
  foldersFiles = foldersFiles.map((result) => (result.status === 'fulfilled' ? result.value : result.reason))

  let files = await Promise.allSettled(filesPromises)
  files = files.map((result) => (result.status === 'fulfilled' ? result.value : result.reason))

  return Object.assign(files, foldersFiles)
}

function flatFileTree(fileTree) {
  const flatten = (item) => {
    if (Object.keys(item).length === 1) {
      const folderKey = Object.keys(item)[0]
      return flatMapDeep(item[folderKey], flatten)
    }
    return item
  }

  return flatMapDeep(fileTree, flatten)
}

async function getRepoInfo(repoUrl) {
  let fileTree = await getFileTree(repoUrl)
  fileTree = flatFileTree(fileTree)

  return fileTree
}

module.exports = { getRepoInfo }
