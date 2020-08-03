const cheerio = require('cheerio')
const flatMapDeep = require('lodash.flatmapdeep')
const groupBy = require('lodash.groupby')
const { client } = require('./httpService')

// parse the file tree
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
  isFolder: undefined, // remove isFolder key for file
  lines: parseInt(response.headers['content-lines'], 10), // count lines of file
  bytes: parseInt(response.headers['content-length'], 10) // get bytes from header
})

// get raw html for each file in file tree
async function getFileTree(url) {
  // get the file tree
  const repoRawHtml = await client.get(url).then((response) => response.data)
  const items = parseListFiles(repoRawHtml)

  // create all promises for folders
  const foldersPromises = items.filter((item) => item.isFolder)
    .map((folder) => getFileTree(folder.href) // search all folders recursively
      .then((files) => ({ [folder.name]: files })))

  // create all promises for files
  const filesPromises = items.filter((item) => !item.isFolder)
    // get individual file using raw.githubusercontent for best performace
    .map((file) => client.get(`https://raw.githubusercontent.com${file.href}`)
      .then((response) => {
        const lineAndSize = parseFile(response)
        return { ...file, ...lineAndSize }
      }).catch((err) => ({ ...file, error: err.response.statusText || 'error' })))

  // execute all promises
  let foldersFiles = await Promise.allSettled(foldersPromises)
  foldersFiles = foldersFiles.map((result) => (result.status === 'fulfilled' ? result.value : result.reason))

  let files = await Promise.allSettled(filesPromises)
  files = files.map((result) => (result.status === 'fulfilled' ? result.value : result.reason))

  // returns a merge of the files, and the files that were inside a folder
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
  return groupBy(fileTree, (file) => file.extension)
}

module.exports = { getRepoInfo }
