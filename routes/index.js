const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
	res.render('index', {
		title: 'Home'
	});
});

router.get('/about', (req, res, next) => {
	res.render('about', {
		title: 'About us'
	});
});

module.exports = router;
