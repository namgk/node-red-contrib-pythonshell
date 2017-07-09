function PythonshellInNode(config) {
  if (!config.pyfile){
    throw 'pyfile not present';
  }

  this.pyfile = config.pyfile;
  this.spawn = require('child_process').spawn;
}

PythonshellInNode.prototype.onInput = function(msg, out, err) {
  msg = msg.payload || '';
  if (typeof msg === 'object'){
    msg = JSON.stringify(msg);
  } else {
    msg = msg.toString();
  }

  var py = this.spawn('python', [this.pyfile, msg]);
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
      out({payload: dataString.trim()});
    }
  }.bind(this));
};

PythonshellInNode.prototype.onClose = function() {
  console.log('resource freed')
};


module.exports = PythonshellInNode