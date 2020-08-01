const cheerio = require('cheerio')

const parseListFiles = (repoHtml) => {
  const $ = cheerio.load(repoHtml)
  const files = $('.Box-row.js-navigation-item').map((index, element) => {
    const linkFile = $(element).find('a')
    const iconName = $(element).find('svg').attr('aria-label')
    return {
      name: linkFile.attr('title'),
      href: linkFile.attr('href'),
      isFolder: iconName === 'Directory'
    }
  });
  // returning with ToArray because cheerio returns an object of his "type"
  return files.toArray().filter((file) => file.name !== 'Go to parent directory')
}

const parseFile = (fileHtml) => {
  const $ = cheerio.load(fileHtml)
  const content = $('.repository-content')
}

module.exports = { parseListFiles, parseFile }
