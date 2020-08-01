const cheerio = require('cheerio')

const parseListFiles = (repoHtml) => {
  const $ = cheerio.load(repoHtml)
  const files = $('.Box-row.js-navigation-item').map((index, element) => {
    const linkFile = $(element).find('a')
    return {
      name: linkFile.attr('title'),
      href: linkFile.attr('href')
    }
  });
  // returning with ToArray because cheerio returns an object of his "type"
  return files.toArray()
}

module.exports = { parseListFiles }
