var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('underscore');
var bcrypt = require('bcrypt');
var db = require('./db.js');
var port = process.env.PORT || 3000;
console.log(port);
var todoNext = 0;
var todos = [];
var middleware = require('./middleware.js')(db);

app.use(bodyParser.json()); //When a JSON request comes in
//body-parser is going to parse it for us,
//making it accessible.

//GET /todos
//query /todos?completed=true&q=lunch
app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var query = req.query;
	var where = {};
	where.userId = req.user.id;
	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}
	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		}
	}
	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}).catch(function(e) {
		res.json(e.toJSON());
	});
	// var filteredTodos = todos;
	// if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
	// 	filteredTodos = _.where(filteredTodos, {
	// 		completed: true
	// 	});
	// } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
	// 	filteredTodos = _.where(filteredTodos, {
	// 		completed: false
	// 	});
	// }

	// if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
	// 	filteredTodos = _.filter(filteredTodos, function(todo) {
	// 		return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
	// 	});
	// }

	// res.json(filteredTodosP);
})

//GET todos/:id

app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id);
	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}).catch(function(e) {
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
app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	body.userId = req.user.id;
	// console.log(body);
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

app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoToBeDeletedId = parseInt(req.params.id);
	db.todo.destroy({
		where: {
			id: todoToBeDeletedId
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted > 0) {
			res.status(204).send();

		} else {
			res.status(404).json({
				error: "Id did not match"
			});
		}
	}, function(error) {
		res.status(500).send();
	});
	// var toBeDeleted = _.findWhere(todos, {
	// 	id: todoToBeDeletedId
	// });
	// if (toBeDeleted) {
	// 	todos = _.without(todos, toBeDeleted);
	// 	console.log('Deleted Todo: ' + toBeDeleted.description);
	// 	res.json(toBeDeleted);
	// } else {
	// 	res.status(400).send();
	// }
});

app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id);
	var body = _.pick(req.body, 'completed', 'description');
	var attributes = {};
	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}
	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}
	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(error) {
				res.status(400).json(error.toJSON());
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});
	// var matchedTodoItem = _.findWhere(todos, {
	// 	id: todoId
	// });
	// var body = _.pick(req.body, 'completed', 'description');
	// var update = {};
	// if (!matchedTodoItem) {
	// 	return res.status(404).send();
	// }
	// if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
	// 	update.completed = body.completed;
	// } else if (body.hasOwnProperty('completed')) {
	// 	// return res.status(400).send();
	// }

	// if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
	// 	update.description = body.description;
	// } else if (body.hasOwnProperty('description')) {
	// 	return res.status(400).send();
	// }

	// _.extend(matchedTodoItem, update);
	// res.json(matchedTodoItem);
});

app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON());
	}, function(e) {
		res.status(400).json(e);
	});
});

app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');
		if (token) {
			res.header('Auth', token).json(user.toPublicJSON());
		} else {
			res.status(401).send();
		}
	}, function(e) {
		res.status(401).send();
	});
});

db.sequelize.sync({
	// force: true
}).then(function() {
	app.listen(port, function() {
		console.log('Express Server running on port ' + port);
	});
}).catch(function(e) {
	console.log(e.toJSON());
});