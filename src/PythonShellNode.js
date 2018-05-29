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

  this.continuous = config.stdInData ? true : config.continuous;
  this.stdInData = config.stdInData;
  this.pydir = this.pyfile.substring(0, this.pyfile.lastIndexOf('/'));
  this.pyfile = this.pyfile.substring(this.pyfile.lastIndexOf('/') + 1, this.pyfile.length);
  this.spawn = require('child_process').spawn;
}

PythonshellInNode.prototype.onInput = function(msg, out, err) {
  msg = msg.payload || '';
  if (typeof msg === 'object'){
    msg = JSON.stringify(msg);
  } else if (typeof msg !== 'string'){
    msg = msg.toString();
  }

  var spawnCmd = (this.virtualenv ? this.virtualenv + '/bin/' : '') + 'python'

  if (this.stdInData){
    if (!this.py){
      this.py = this.spawn(spawnCmd, ['-u', this.pyfile], {
        cwd: this.pydir
      });
      this.firstExecution = true
    } else {
      this.firstExecution = false
    }
  } else {
    this.py = this.spawn(spawnCmd, ['-u', this.pyfile, msg], {
      cwd: this.pydir
    });
  }

  // subsequence message, no need to setup callbacks
  if (this.stdInData && !this.firstExecution){
    console.log('writing ' + msg)
    this.py.stdin.write(msg + '\n')
    return
  }

  var py = this.py;
  var dataString = '';
  var errString = '';

  py.stdout.on('data', data => {
    let dataStr = data.toString().trim();

    if (this.continuous){
      dataString = dataStr;
      out({payload: dataString});
    } else {
      dataString += dataStr;
    }
  });

  py.stderr.on('data', data => {
    errString += String(data);// just a different way to do it
  });

  py.on('close', code =>{
    if (code){
      err('exit code: ' + code + ', ' + errString);
    } else{
      if (!this.continuous){
        out({payload: dataString.trim()});
      }
    }
  });

  if (this.stdInData){
    console.log('writing first time ' + msg)
    py.stdin.write(msg + '\n')
  }
};

PythonshellInNode.prototype.onClose = function() {
  if (this.py){
    this.py.kill();
    console.log('terminated')
  }
};


module.exports = PythonshellInNode