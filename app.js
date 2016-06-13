var express = require('express')
var app     = express()
var multer  = require('multer')
var upload  = multer({dest: 'uploads/'})
var crypto  = require('crypto')
var mongo   = require('mongodb').MongoClient

app.use(express.static('public'))
app.engine('html', require('ejs').renderFile)
app.get('/', home)
app.get ('/login', showLogin)
app.post('/login', upload.array(), checkLogin)
app.get ('/register', register)
app.post('/register', upload.array(), registerNewUser)
app.listen(8000)

function home(req, res) {
	res.render('index.html')
}

function register(req, res) {
	res.render('register.html')
}

function registerNewUser(req, res) {
	var data = {}
	data.fullname = req.body.fullname
	data.email    = req.body.email
	data.password = encode(req.body.password)
	mongo.connect("mongodb://127.0.0.1/enemy",
		(e, db) => {
			db.collection('user').find({email: data.email})
			.toArray(
				(e, d) => {
					if (d.length == 0) {
						db.collection('user').insert(data)
						res.redirect('/login')
					} else {
						res.redirect('/register?Duplicated')
					}
				}
			)
		}	
	)
}

function encode(password) {
	return crypto.createHmac('sha512', password)
			.update('I miss you').digest('hex')
}

function showLogin(req, res) {
	res.render('login.html')
}

function checkLogin(req, res) {
	var e = req.body.email
	var p = encode(req.body.password)

	mongo.connect('mongodb://127.0.0.1/enemy',
		(error, db) => {
			db.collection('user').find({email:e, password:p})
			.toArray(
				(error, data) => {
					if (data.length == 0) {
						res.redirect('/login?Incorrect Password')
					} else {
						res.redirect('/profile')
					}
				}
			)
		}
	)
}