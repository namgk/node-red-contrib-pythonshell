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

  this.continuous = config.continuous;
  this.pydir = this.pyfile.substring(0, this.pyfile.lastIndexOf('/'));
  this.pyfile = this.pyfile.substring(this.pyfile.lastIndexOf('/') + 1, this.pyfile.length);
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

  this.py = this.spawn(spawnCmd, [this.pyfile, msg], {
    cwd: this.pydir
  });

  var py = this.py;
  var dataString = '';
  var errString = '';

  py.stdout.on('data', function(data){
    let dataStr = data.toString().trim();

    if (this.continuous){
      dataString = dataStr;
      out({payload: dataString});
    } else {
      dataString += dataStr;
    }
  }.bind(this));

  py.stderr.on('data', function(data){
    errString += String(data);// just a different way to do it
  });

  py.on('close', function(code) {
    if (code){
      err('exit code: ' + code + ', ' + errString);
    } else{
      if (!this.continuous){
        out({payload: dataString.trim()});
      }
    }
  }.bind(this));
};

PythonshellInNode.prototype.onClose = function() {
  if (this.py){
    this.py.kill();
    console.log('terminated')
  }
};


module.exports = PythonshellInNode