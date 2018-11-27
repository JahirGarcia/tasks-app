const auth = require('./auth/index');
const compression = require('compression');
const createError = require('http-errors');
const csrf = require('csurf');
const env = require('node-env-file');
const express = require('express');
const flash = require('connect-flash');
const helmet = require('helmet');
const logger = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const serveStatic = require('serve-static');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

// app setup
const app = express();

// environment variables
env(path.join(__dirname, '.env'));

// users authentication
auth.initialize();

// routes setup
const indexRouter = require('./routes/index');
const tasksRouter = require('./routes/tasks');
const authRouter = require('./routes/auth');

// database connection
mongoose.connect(process.env.MLAB_URI).then(() => {
	console.log('Database connected');
}).catch(err => {
	console.error(err);
	process.exit(1);
});

// set port
app.set('port', process.env.PORT || 3000);

// set engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// middlewares
app.use(helmet());
app.use(compression());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: true,
	saveUninitialized: true,
	key: process.env.SESSION_KEY,
	store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(csrf());
app.use(methodOverride('_method'));
app.use(serveStatic(path.join(__dirname, 'public')))

// routes
app.use(auth.pushUser());
app.use('/auth', authRouter);
app.use('/', indexRouter);
app.use(auth.restrictRoutes());
app.use('/tasks', tasksRouter);

// page not found
app.use((req, res, next) => {
	next(createError(404));
});

// error handler
app.use((err, req, res, next) =>{
console.log(err);
	res.status(err.status || 500).json(err);
});

// start server
app.listen(app.get('port'), () => {
	console.log('Server on port', app.get('port'));
});
