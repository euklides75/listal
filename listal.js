#! /usr/bin/env node

var fs = require('fs');
var exec = require('child_process').exec
var http = require('http')
var url = require('url')
var argv = require('optimist')
  .usage('Usage: listal.js -u url [-t timeOut] [-c concurrency] [-p page_start[-page_end]] [-s]\n\nDo not append the pictures path in the end\n\OK: listal -u http://www.listal.com/movie/inception\nNot OK: listal -u http://www.listal.com/movie/inception/pictures')
  .demand(['u'])
  .default('o', 'target')
  .default('t', 15)
  .default('p', '1')
  .default('c', 5)
  .alias('o', 'outputDir')
  .alias('u', 'url')
  .alias('t', 'timeOut')
  .alias('c', 'concurrency')
  .alias('p', 'pages')
  .alias('s', 'skip')
  .describe('t', 'Seconds to wait before quitting')
  .describe('c', 'Concurrent downloads')
  .describe('p', 'e.g. 25 or 10-15')
  .describe('s', 'Skip if file exists')
  .argv


// getId for url
var urlParts = argv.u.split('/')
  , urlID

if (urlParts[urlParts.length - 1] == "")
  urlID = urlParts[urlParts.length - 2]
else
  urlID = urlParts[urlParts.length - 1]

var urlTemplate = argv.u + "/pictures//$page"
  , baseTargetPath = argv.o + '/' + urlID

console.log ("### Listal scanner ###\n")
console.log ("Using url\t\t:" + argv.u)
console.log ("Timeout\t\t:" + argv.t)
console.log ("Concurrency\t:" + argv.c)
console.log ("Pages\t\t:" + argv.p)
console.log ("Skip\t\t:" + !!argv.s)
console.log ("Dumping contents into \t\t:" + baseTargetPath + "\n")


try {
  stats = fs.lstatSync(argv.o)
}
catch (e) {
  fs.mkdirSync(argv.o)
}

try {
  stats = fs.lstatSync(baseTargetPath)
}
catch (e) {
  fs.mkdirSync(baseTargetPath)
}

var downloadTemplate = "http://ilarge.listal.com/image/$id/10000full-$name.jpg"
  .replace('$name',urlID)

var picturePattern = /http:\/\/www.listal.com\/viewimage\/(\d+)/g

var concurrentPageLimit = argv.c
  , timeOut = argv.t
  , pageRange = argv.p
  , skipExisting = argv.s
  , imagesDownloaded = 0
  , lastImagesDownloaded = 0
  , pageSize = 20
  , pageStart = 1
  
var pageEnd, lastPageReached
  
if (pageRange) {
  var values = pageRange.split('-')
  if(values.length == 1) {
    pageStart = validateAndParse(values[0])
  } else if (values.length == 2) {
    pageStart = validateAndParse(values[0])
    pageEnd = validateAndParse(values[1])
  } else {
    console.log("Invalid page range")
    process.exit(0)
  }
}

var currentPage = pageStart;
  
for (var j = 0 ; j < concurrentPageLimit ; j++ ) { getNextPage()}

setInterval(function() {
  if (lastImagesDownloaded == imagesDownloaded) {
    if(lastPageReached) {
      console.log("Last page reached")
    }
    console.log("No images downloaded for 15 seconds, quitting. " + imagesDownloaded + " images downloaded for " + urlID)
    process.exit(0)
  }
  lastImagesDownloaded = imagesDownloaded
}, timeOut * 1000)


function getNextPage() {
  if(pageEnd && currentPage > pageEnd) {
    if(!lastPageReached) {
       lastPageReached = true;
    }
    return
  }
  var currentURL = urlTemplate.replace('$page', currentPage++)
  var request = http.get(currentURL, processResult)

  request.on('error', function(e) {
    console.log("Got error: " + e.message)
  })

}

function processResult(res) {

  console.log("Fetched page:" + res.req.path)

  res.on("data", function(chunk) {
    match = picturePattern.exec(chunk)
    while (match != null) {
      downloadFile(downloadTemplate.replace('$id',match[1]), match[1])
      match = picturePattern.exec(chunk)
    }
  })
}

function downloadFile(file_url, id) {

  var targetFileName = argv.o + '/' + urlID + '/' + id + '.jpg'

  fs.access(targetFileName, (err) => {

    if (skipExisting && !err) {
      console.log('Skipping ' + targetFileName)
      imagesDownloaded++
      if(imagesDownloaded % pageSize == 0) getNextPage()
      return
    }
    
    var curl = 'curl -o ' + targetFileName  + ' ' + file_url

    var child = exec(curl, function(err, stdout, stderr) {
      if (err) {
        console.log(err)
      } else {
        console.log(file_url + ' downloaded to ' + targetFileName)
      }
      
      imagesDownloaded++
      if(imagesDownloaded % pageSize == 0) getNextPage()
    })
  });

}

function validateAndParse(n) {
  if(!isNumeric(n)) {
    console.log("Invalid page range")
    process.exit(0)
  }
  return parseInt(n, 10)
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}