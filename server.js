var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var todos = [{
	id: 1,
	description: 'Study for exams',
	completed: false
},{
	id: 2,
	description: 'Trim moustache',
	completed: false
},{
	id: 3,
	description: 'Feed the homeless',
	completed: true
}];

app.get('/',function(req,res){
	res.send('Todo API Root');
});

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

app.listen(port,function(){
	console.log('Express Server running on port ' + port);
});