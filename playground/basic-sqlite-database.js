var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlitef'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			notEmpty: true
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});


sequelize.sync({

// 	force: true
}).then(function() {
		Todo.findById(3).then(function(todo) {
		if (todo) {
			console.log(todo.toJSON());
		}
	}).catch(function(error) {
		console.log('Item not found');
		// console.log(error);
	});
// 	Todo.create({
// 		description: 'Take out trash'
// 	}).then(function(todo) {
// 		console.log(todo.toJSON());
// 		Todo.create({
// 			description: 'Clean workplace'
// 		}).then(function(todo) {
// 			return Todo.findAll();
// 		}).catch(function(error) {
// 			console.log(error);
// 		});
// 	}).catch(function(error) {
// 		console.log(error);
// 	});
// }).catch(function(error) {
// 	console.log(error);
});