var PythonshellNode = require('../src/PythonShellNode');

var assert = require('assert');
describe('Pythonshell Node', function() {
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
				var pyNode = new PythonshellNode({virtualenv: "./test/venv"});
				done(1)
    	} catch (e){
    		done()
    	}
    });

    it('should throw an error for non existing python file', function(done) {
    	try {
				var pyNode = new PythonshellNode({pyfile: "./test/sample.p"});
				done(1)
    	} catch (e){
    		done()
    	}
    });

    it('should throw an error for non existing python virtualenv', function(done) {
    	try {
				var pyNode = new PythonshellNode({
					pyfile: "./test/sample.py",
					virtualenv: "./test/venvv"
				});
				done(1)
    	} catch (e){
    		done()
    	}
    });

    it('should throw an error when importing external libraries without venv', function(done) {
			var pyNode = new PythonshellNode({pyfile: "./test/sample-need-venv.py"});

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
				pyfile: "./test/sample.py"
			});

			pyNode.onInput({payload: ""}, function(result){
			  assert.notEqual(result.payload, null);
			  assert.equal(result.payload, 'hi');
			  done()
			}, function(err){
			  done(err)
			});
    });

    it('should pass arguments to script', function(done) {
			var pyNode = new PythonshellNode({
				pyfile: "./test/sample-with-arg.py"
			});

			pyNode.onInput({payload: "firstArg secondArg"}, function(result){
			  assert.notEqual(result.payload, null);
			  assert.equal(result.payload, 'firstArg secondArg');
			  done()
			}, function(err){
			  done(err)
			});
    });

    it('should support virtual env', function(done) {
			var pyNode = new PythonshellNode({
				pyfile: "./test/sample-need-venv.py",
				virtualenv: "./test/venv"
			});

			pyNode.onInput({payload: ""}, function(result){
			  assert.notEqual(result.payload, null);
			  assert.equal(result.payload, 'hi from venv');
			  done()
			}, function(err){
			  done(err)
			});
    });
  });
});