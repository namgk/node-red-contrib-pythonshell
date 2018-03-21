var fs = require("fs");

function PythonshellInNode(config) {
  if (!config.pyfile){
    throw 'pyfile not present';
  }

  this.pyfile = config.pyfile;
  this.virtualenv = config.virtualenv;

  if (!fs.existsSync(this.pyfile)) {
    throw 'pyfile not exist';
  }

  if (this.virtualenv && !fs.existsSync(this.virtualenv)){
    throw 'configured virtualenv not exist, consider remove or change';
  }

  this.spawn = require('child_process').spawn;
}

PythonshellInNode.prototype.onInput = function(msg, out, err) {
  msg = msg.payload || '';
  if (typeof msg === 'object'){
    msg = JSON.stringify(msg);
  } else {
    msg = msg.toString();
  }

  var spawnCmd = (this.virtualenv ? this.virtualenv + '/bin/' : '') + 'python'

  var py = this.spawn(spawnCmd, [this.pyfile, msg]);
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