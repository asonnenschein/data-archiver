var async = require('async')
  , program = require('commander')
;

program
  .version('2.0.0-dev')
  .option('-u, --url', 'CSW URL endpoint to scrape data from')
  .parse(process.argv)
;

var queue = [];
if (program.url) queue.push(scrapeCSW);
async.series(queue);

function scrapeCSW () {

}