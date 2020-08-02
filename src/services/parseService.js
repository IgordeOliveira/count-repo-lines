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
      href: linkFile.attr('href'),
      isFolder: iconName === 'Directory'
    }
  });
  // returning with ToArray because cheerio returns an object of his "type"
  return files.toArray().filter((file) => file.name !== 'Go to parent directory')
}

const parseFile = (fileHtml) => {
  const $ = cheerio.load(fileHtml, { normalizeWhitespace: true })
  const rawContent = $('.repository-content').find('div.text-mono').first().text()
  const values = rawContent.trim().replace('\n      \n    ', '|').split('|') // clear content
  return {
    lines: values[1] ? parseInt(values[0].substr(0, values[0].indexOf(' ')), 10) : undefined, // convert to int
    size: values[1] || values[0]
  }
}

module.exports = { parseListFiles, parseFile }
