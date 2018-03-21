var fs = require('fs')
var assert = require('assert');

var PythonshellNode = require('../src/PythonShellNode');

describe('Pythonshell Node', function() {
	var venv = "/venv";

	before(function(done){
		this.timeout(10000);

		if (fs.existsSync(__dirname + venv)) {
	    done();
	    return;
	  }

	  console.log('creating virtual environment for testing')

		var spawn = require('child_process').spawn;
		var ve;
		try {
			ve = spawn('virtualenv', [__dirname + venv]);
		} catch (e){
			done(e);
		}

		ve.stdout.on('data', d=>console.log(d.toString()));
		ve.stderr.on('data', d=>console.log(d.toString()));

	  ve.on('close', function(code) {
	    if (code){
	      done(code);
	    } else{
	      try {
					var pipInstall = spawn(__dirname + venv + '/bin/pip', ['install', 'lxml']);
					pipInstall.stdout.on('data', d=>console.log(d.toString()));
					pipInstall.stderr.on('data', d=>console.log(d.toString()));
					pipInstall.on('close', done)
				} catch (e){
					done(e);
				}
	    }
	  });
	});

	describe('Failing cases', function(){
    it('should throw an error for empty config', function(done) {
    	try {
				var pyNode = new PythonshellNode();
				done(1)
    	} catch (e){
    		done()
    	}
    });

    it('should throw an error for empty config', function(done) {
    	try {
				var pyNode = new PythonshellNode({});
				done(1)
    	} catch (e){
    		done()
    	}
    });

    it('should throw an error for config without python file', function(done) {
    	try {
				var pyNode = new PythonshellNode({virtualenv: __dirname + venv});
				done(1)
    	} catch (e){
    		done()
    	}
    });

    it('should throw an error for non existing python file', function(done) {
    	try {
				var pyNode = new PythonshellNode({pyfile: __dirname + "/sample.p"});
				done(1)
    	} catch (e){
    		done()
    	}
    });

    it('should throw an error for non existing python virtualenv', function(done) {
    	try {
				var pyNode = new PythonshellNode({
					pyfile: __dirname + "/sample.py",
					virtualenv: __dirname + "/awefaewaf"
				});
				done(1)
    	} catch (e){
    		done()
    	}
    });

    it('should throw an error when importing external libraries without venv', function(done) {
			var pyNode = new PythonshellNode({pyfile: __dirname + "/sample-need-venv.py"});

			pyNode.onInput({payload: ""}, function(result){
			  done(1)
			}, function(err){
			  done()
			});
    });
	})


  describe('Run Python script', function() {
    it('should return the script result', function(done) {
			var pyNode = new PythonshellNode({
				pyfile: __dirname + "/sample.py"
			});

			pyNode.onInput({payload: ""}, function(result){
				if (result.onGoing){
					return;
				}
			  assert.notEqual(result.payload, null);
			  assert.equal(result.payload, 'hi');
			  done()
			}, function(err){
			  done(err)
			});
    });

    it('should output script ongoing result', function(done) {
    	this.timeout(3000);

			var pyNode = new PythonshellNode({
				pyfile: __dirname + "/sample-loop.py"
			});

			pyNode.onInput({payload: ""}, function(result){
				if (result.onGoing){
					return;
				}
				assert.notEqual(result.payload, null);
			  assert.notEqual(result.payload.indexOf('loop ended'), -1);
			  done();
			}, function(err){
			  done(err)
			});
    });

    it('should pass arguments to script', function(done) {
			var pyNode = new PythonshellNode({
				pyfile: __dirname + "/sample-with-arg.py"
			});

			pyNode.onInput({payload: "firstArg secondArg"}, function(result){
				if (result.onGoing){
					return;
				}
			  assert.notEqual(result.payload, null);
			  assert.equal(result.payload, 'firstArg secondArg');
			  done()
			}, function(err){
			  done(err)
			});
    });

    it('should support file read', function(done) {
			var pyNode = new PythonshellNode({
				pyfile: __dirname + "/sample-file-read.py"
			});

			pyNode.onInput({payload: ""}, function(result){
				if (result.onGoing){
					return;
				}
			  assert.notEqual(result.payload, null);
			  assert.equal(result.payload, fs.readFileSync(__dirname + '/test.txt', 'utf8'));
			  done()
			}, function(err){
			  done(err)
			});
    });

    it('should support virtual env', function(done) {
			var pyNode = new PythonshellNode({
				pyfile: __dirname + "/sample-need-venv.py",
				virtualenv: __dirname + venv
			});

			pyNode.onInput({payload: ""}, function(result){
				if (result.onGoing){
					return;
				}
			  assert.notEqual(result.payload, null);
			  assert.equal(result.payload, 'hi from venv');
			  done()
			}, function(err){
			  done(err)
			});
    });

    it('should support virtual env and file read', function(done) {
			var pyNode = new PythonshellNode({
				pyfile: __dirname + "/sample-need-venv-file-read.py",
				virtualenv: __dirname + venv
			});

			pyNode.onInput({payload: ""}, function(result){
				if (result.onGoing){
					return;
				}
			  assert.notEqual(result.payload, null);
			  assert.equal(result.payload, fs.readFileSync(__dirname + '/test.txt', 'utf8'));
			  done()
			}, function(err){
			  done(err)
			});
    });
  });
});