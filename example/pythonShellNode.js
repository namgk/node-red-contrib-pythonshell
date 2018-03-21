var PythonshellNode = require('../src/PythonShellNode');

var pyNode = new PythonshellNode({
	pyfile: "./test/sample.py"
});

pyNode.onInput({payload: ""}, function(result){

}, function(err){

});`