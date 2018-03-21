var PythonshellNode = require('../src/PythonShellNode');

var assert = require('assert');
describe('Pythonshell Node', function() {
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

    it('should throw an error', function(done) {
			var pyNode = new PythonshellNode({
				pyfile: "./test/sample.p"
			});

			pyNode.onInput({payload: ""}, function(result){
			  done(1)
			}, function(err){
				console.log(err)
			  done()
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
  });
});