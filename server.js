var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 3000;
var todoNext=1;
var todos = [];

app.use(bodyParser.json());//When a JSON request comes in
//body-parser is going to parse it for us,
//making it accessible.

//GET /todos

app.get('/todos',function(req,res){
	res.json(todos);
})

//GET todos/:id

app.get('/todos/:id',function(req,res){
	var todoId = parseInt(req.params.id);
	var matchedTodoItem;
	todos.forEach(function(element){
		if(element.id === todoId){
			matchedTodoItem=element;
		}
	});
		if(matchedTodoItem){
		res.json(matchedTodoItem);
		}
		else{
			res.status(404).send();
		}
	});

//POST /todos
app.post('/todos',function(req,res){
	body = req.body;
	console.log('description ' + body.description);
	body.id = todoNext++;
	todos.push(body);
	res.json(body);
});

app.listen(port,function(){
	console.log('Express Server running on port ' + port);
});