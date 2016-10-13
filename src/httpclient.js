
var http = require("follow-redirects").http;
var https = require("follow-redirects").https;
var urllib = require("url");

function insert(records, ckantsEndpoint, token){
  // TODO: discover this endpoint or get from settings
  var payload = JSON.stringify(records);
  var opts = urllib.parse(ckantsEndpoint);
  opts.headers = {
    'content-type':'application/json', 
    'Authentication': token
  };
  opts.method = 'POST';

  var req = ((/^https/.test(ckantsEndpoint))?https:http).request(opts,function(res) {
    console.log(res.statusCode);
    var result = '';
    res.on('data',function(chunk) {
        result += chunk;
    });
    res.on('end',function() {
        console.log(result);
    });
  });

  req.on('error',function(err) {
    console.log(err);
  });

  if (payload){
    req.write(payload);
  }

  req.end();
}

module.exports = {
  insert: insert
}