const cheerio = require('cheerio')

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
  lines: response.data.toString().split('\n').length - 1, // count lines of file
  bytes: parseInt(response.headers['content-length'], 10) // get bytes from header
})

module.exports = { parseListFiles, parseFile }
