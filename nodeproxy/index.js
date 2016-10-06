let http = require('http')
let request = require('request')
let path = require('path')
let fs = require('fs')
let help =`
Usage: node ./index.js [options]

Examples:
  node index.js -p 8001 -h google.com
`
let argv = require('yargs')
    .default('host', '127.0.0.1')
    .alias('h', 'help')
    .help('help')
    .usage(help)
    .argv

let logPath = argv.log && path.join(__dirname, argv.log)
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout

let scheme = 'http://'
let port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80)
let destinationUrl = argv.url || scheme + argv.host + ':' + port

// echo
http.createServer((req, res) => {
    console.log(`Request received at: ${req.url}`)
    for (let header in req.headers) {
        res.setHeader(header, req.headers[header])
    }
    req.pipe(res)
}).listen(8000)
// end echo

// proxy
http.createServer((req, res) => {
    // Proxy code

    destinationUrl = req.headers['x-destination-url'] ?
        'http://' + req.headers['x-destination-url'] :
        destinationUrl;
    let options = {
        url: `${destinationUrl}${req.url}`,
        method: req.method
    }
    logStream.write('Request headers: ' + JSON.stringify(req.headers))

    req.pipe(request(options)).pipe(res)

    // let downstreamResponse = req.pipe(request(options))
    // process.stdout.write(JSON.stringify(downstreamResponse.headers))
    // downstreamResponse.pipe(process.stdout)
    // downstreamResponse.pipe(res)

}).listen(8001)