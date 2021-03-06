var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');
var fs = require('fs');
var busboy = require('connect-busboy');

FROM = 'benjamin_netanyahu@prime_minister.gov.il';
RECIPIENTS = ["RECIPIENT@gmail.com"]

// Configure the local strategy for use by Passport.
passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));


// Configure Passport authenticated session persistence.
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});




// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());
app.use(busboy())
app.use('/static',express.static(__dirname + '/public'));

//some routing
app.get('/',
    function(req, res){
        res.render('login');
    });

app.post('/',
    passport.authenticate('local', { failureRedirect: '/' , successRedirect:'/email'}));

app.get('/login',
    function(req, res){
        res.render('login');
    });

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/' , successRedirect:'/email'}));

//demand authentication from this point on
app.all('*',require('connect-ensure-login').ensureLoggedIn(),function(a,b,next){
    next();
});
app.get('/email', function(req, res){res.render('email');});


//sending the email
//create the mailgun tranport
var mg = require('nodemailer-mailgun-transport');
var auth = {
    auth: {
        api_key: 'key-fe6816b92d0c9f86bd785272fb349e2b',
        domain: 'sandbox90b082013ec742438a103eba918efb8d.mailgun.org'
    }
};

var transporter = require('nodemailer').createTransport(mg(auth));
var pending = []

app.post('/email',
    function(req, res){
        req.pipe(req.busboy);//accumlate file
        req.busboy.on('file', function (fieldname, file, filename) {
            var localPath = 'Uploads/'+filename;
            var stream = fs.createWriteStream(localPath);
            file.pipe(stream);//save file
            stream.on("close",function(){
                pending.push({filename:filename, path:localPath})
                res.send("queued");
                console.log("queued locally: " + JSON.stringify(pending));
            });


        });
    });
app.all("*",require('body-parser').json());
app.get('/sendmail',
    function(req, res){
        var from = req.query.from;
        var to = req.query.to;
        transporter.sendMail({
            from: from || FROM,
            to: to || RECIPIENTS,
            subject: 'See attached',
            text:"do not respond",
            attachments: pending
}, function (err,info) {
    if(err)res.status("400").send("either from or to are invalid");
    else {
        res.send("sent");
        pending.map(function(elem){fs.unlink(elem.path);});//would like to remove but not sure if azure charges extra for space....
        pending = [];

}
});});

PORT = process.env.port || 1337;
app.listen(PORT);
console.log("app listening on:"+ PORT);
