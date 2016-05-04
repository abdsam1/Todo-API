var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();
var port = process.env.PORT || 3000;
var todoNext=0;
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
	var matchedTodoItem = _.findWhere(todos,{id:todoId});
		if(matchedTodoItem){
		res.json(matchedTodoItem);
		}
		else{
			res.status(404).send();
		}
	});

//POST /todos
app.post('/todos',function(req,res){
	body = _.pick(req.body,'description','completed');
	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length ===0){
		return res.status(400).send();
	}
	body.description = body.description.trim();
	console.log('description: ' + body.description);
	body.id = ++todoNext;
	todos.push(body);
	res.json(body);
});

//DELETE /todos/:id

app.delete('/todos/:id',function(req,res){
	var todoToBeDeletedId = parseInt(req.params.id);
	var toBeDeleted = _.findWhere(todos,{id:todoToBeDeletedId});
	if(toBeDeleted){
		todos = _.without(todos,toBeDeleted);
		console.log('Deleted Todo: '+ toBeDeleted.description);
		res.json(toBeDeleted);
	}
	else{
		res.status(400).send();
	}
});



app.listen(port,function(){
	console.log('Express Server running on port ' + port);
});