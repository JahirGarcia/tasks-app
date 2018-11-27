const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

initialize = () => {
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});
	
	passport.deserializeUser((id, done) => {
		User.findById(id).then(user => {
			done(null, user);
		}).catch(err => {
			done(err);
		});
	});

	passport.use('localSignup', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	}, (req, username, password, done) => {
		const { email, confirm_password } = req.body;
		const errors = [];
		User.findOne({ email }).then(user => {
			if(user) {
				errors.push({ message: 'There is already an account using this email' });
				return done(null, false, req.flash('errors', errors));
			} else {
				User.create({ 
					username, 
					email, 
					password: User.encryptPassword(password) 
				}).then(user => {
					return done(null, user);
				}).catch(err => {
					return done(err);
				});
			}
		}).catch(err => {
			return done(err);
		});
	}));
	
	passport.use('localSignin', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	}, (req, username, password, done) => {
		User.findOne({ username }).then(user => {
			const errors = [];
			if(!user) {
				errors.push({ message: 'Username or password are incorrect' });
				return done(null, false, req.flash('errors', errors));
			} else {
				if(user.comparePassword(password)) {
					return done(null, user);
				} else {
					errors.push({ message: 'Username or password are incorrect' });
					return done(null, false, req.flash('errors', errors));
				}
			}
		}).catch(err => {
			return done(err);
		});
	}));
};

restrictRoutes = () => {
	return restrictRoutes = (req, res, next) => {
		if(req.isAuthenticated()) {
			next();
		} else {
			res.redirect('/auth/signin');
		}
	};
};

const pushUser = () => {
	return pushUer = (req, res, next) => {
		res.locals.user = req.user || null;
		next();
	};
};

module.exports = {
	initialize,
	restrictRoutes,
	pushUser
};