const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/signin', (req, res, next) => {
	res.render('auth/signin', {
		title: 'Sign in',
		csrfToken: req.csrfToken(),
		errors: req.flash('errors')
	});
});

router.post('/signin', (req, res, next) => {
	const { username, password } = req.body;
	const errors = [];
	if(!username) {
		errors.push({ message: 'Please type your username' });
	}
	if(!password) {
		errors.push({ message: 'Please type your password' });
	}
	if(errors.length > 0) {
		req.flash('errors', errors);
		res.redirect('/auth/signin');
	} else {
		passport.authenticate('localSignin', {
			successRedirect: '/tasks',
			failureRedirect: '/auth/signin',
			passReqToCallback: true
		})(req, res, next);
	}
});

router.get('/signup', (req, res, next) => {
	res.render('auth/signup', {
		title: 'Sign up',
		csrfToken: req.csrfToken(),
		user: req.flash('user'),
		errors: req.flash('errors')
	});
});

router.post('/signup', (req, res, next) => {
	const { username, email, password, confirm_password } = req.body;
	const errors = [];
	if(!username) {
		errors.push({ message: 'Please type a username' });
	}
	if(!email) {
		errors.push({ message: 'Please type your email' });
	}
	if(!password) {
		errors.push({ message: 'Please type a password' });
	}
	if(!confirm_password) {
		errors.push({ message: 'Please confirm your password' });
	}
	if(password && confirm_password && password !== confirm_password) {
		errors.push({ message: 'Passwords do not match' });
	}
	if(errors.length > 0) {
		req.flash('errors', errors);
		req.flash('user', { username, email });
		res.redirect('/auth/signup');
	} else {
		passport.authenticate('localSignup', {
			successRedirect: '/tasks',
			failureRedirect: '/auth/signup',
			passReqToCallback: true
		})(req, res, next);
	}
});

router.get('/signout', (req, res, next) => {
	req.logout();
	res.redirect('/');
});

module.exports = router;
