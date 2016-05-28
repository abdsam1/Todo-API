var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var app = express();
var port = process.env.PORT || 3000;
var todoNext = 0;
var todos = [];

app.use(bodyParser.json()); //When a JSON request comes in
//body-parser is going to parse it for us,
//making it accessible.

//GET /todos
//query ?completed=true&q=lunch
app.get('/todos', function(req, res) {
	var queryParams = req.query;
	var filteredTodos = todos;
	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {
			completed: true
		});
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {
			completed: false
		});
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function(todo) {
			return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
		});
	}

	res.json(filteredTodosP);
})

//GET todos/:id

app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id);
	db.todo.findById(todoId).then(function(todo){
		if(todo){
			res.json(todo.toJSON());
		}
		else{
			res.status(404).send();
		}
	}).catch(function(e){
		res.status(500).send();
	});
	// var matchedTodoItem = _.findWhere(todos, {
	// 	id: todoId
	// });
	// if (matchedTodoItem) {
	// 	res.json(matchedTodoItem);
	// } else {
	// 	res.status(404).send();
	// }
});

//POST /todos
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}).catch(function(e) {
		res.status(400).json('wrong');
	});

	// if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
	// 	return res.status(400).send();
	// }
	// body.description = body.description.trim();
	// console.log('description: ' + body.description);
	// body.id = ++todoNext;
	// todos.push(body);
	// res.json(body);
});

//DELETE /todos/:id

app.delete('/todos/:id', function(req, res) {
	var todoToBeDeletedId = parseInt(req.params.id);
	var toBeDeleted = _.findWhere(todos, {
		id: todoToBeDeletedId
	});
	if (toBeDeleted) {
		todos = _.without(todos, toBeDeleted);
		console.log('Deleted Todo: ' + toBeDeleted.description);
		res.json(toBeDeleted);
	} else {
		res.status(400).send();
	}
});

app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id);
	var matchedTodoItem = _.findWhere(todos, {
		id: todoId
	});
	var body = _.pick(req.body, 'completed', 'description');
	var update = {};
	if (!matchedTodoItem) {
		return res.status(404).send();
	}
	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		update.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		// return res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		update.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	_.extend(matchedTodoItem, update);
	res.json(matchedTodoItem);
});

db.sequelize.sync().then(function() {
	app.listen(port, function() {
		console.log('Express Server running on port ' + port);
	});
}).catch(function(e) {
	console.log(e.toJSON());
});