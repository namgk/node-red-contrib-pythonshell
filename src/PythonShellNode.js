function PythonshellInNode(config) {
  if (!config.pyfile){
    throw 'pyfile not present';
  }

  this.pyfile = config.pyfile;
  this.spawn = require('child_process').spawn;
}

PythonshellInNode.prototype.onInput = function(msg, out, err) {
  payload = msg.payload || '';
  if (typeof payload === 'object'){
    payload = JSON.stringify(payload);
  } else {
    payload = payload.toString();
  }

  var py = this.spawn('python', [this.pyfile, payload]);
  var dataString = '';
  var errString = '';

  py.stdout.on('data', function(data){
    dataString += data.toString();
  });

  py.stderr.on('data', function(data){
    errString += String(data);// just a different way to do it
  });

  py.on('close', function(code) {
    if (code){
      err('exit code: ' + code + ', ' + errString);
    } else{
      msg.payload = dataString.trim();
      out(msg);
    }
  }.bind(this));
};

PythonshellInNode.prototype.onClose = function() {
  console.log('resource freed')
};


module.exports = PythonshellInNode