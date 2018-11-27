const createError = require('http-errors');
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

router.get('/', (req, res, next) => {
	Task.find({ user: req.user.id }).sort({ date: 'desc' }).then(tasks => {
		res.render('tasks/index', {
			title: 'Tasks',
			csrfToken: req.csrfToken(),
			message: req.flash('message'),
			tasks
		});
	}).catch(err => {
		next(createError(500, err));
	});
});

router.get('/add', (req, res, next) => {
	res.render('tasks/add', {
		title: 'Add task',
		task: req.flash('task'),
		errors: req.flash('errors'),
		csrfToken: req.csrfToken()
	});
});

router.post('/add', (req, res, next) => {
	const { title, content } = req.body;
	const errors = [];
	if(!title) {
		errors.push({ message: 'Please type a title' });
	}
	if(!content) {
		errors.push({ message: 'Please type the tasks content' });
	}
	if(errors.length > 0) {
		req.flash('task', { title, content });
		req.flash('errors', errors);
		res.redirect('/tasks/add');
	} else {
		Task.create({ title, content, user: req.user.id }).then(task => {
			req.flash('message', 'Task added successfully');
			res.redirect('/tasks');
		}).catch(err => {
			next(createError(500, err));
		});
	}
});

router.get('/edit/:id', (req, res, next) => {
	Task.findById(req.params.id).then(task => {
		res.render('tasks/edit', {
			title: 'Edit task',
			csrfToken: req.csrfToken(),
			errors: req.flash('errors'),
			task
		});
	}).catch(err => {
		next(createError(500, err));
	});
});

router.put('/edit/:id', (req, res, next) => {
	const { title, content } = req.body;
	const errors = [];
	if(!title) {
		errors.push({ message: 'Please type a title' });
	}
	if(!content) {
		errors.push({ message: 'Please type the tasks content' });
	}
	if(errors.length > 0) {
		req.flash('errors', errors);
		res.redirect('/tasks/edit/'+req.params.id);
	} else {
		Task.findByIdAndUpdate(req.params.id, { title, content }).then(task => {
			req.flash('message', 'Task edited successfully');
			res.redirect('/tasks');
		}).catch(err => {
			next(createError(500, err));
		});
	}
});

router.delete('/delete/:id', (req, res, next) => {
	Task.findByIdAndRemove(req.params.id).then(task => {
		req.flash('message', 'Task deleted successfully');
		res.redirect('/tasks');
	}).catch(err => {
		next(createError(500, err));
	});
});

module.exports = router;