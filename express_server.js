const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session', 
  keys: ['7f69fa85-caec-4d9c-acd7-eebdccb368d5', 'f13b4d38-41c4-46d3-9ef6-8836d03cd8eb']
}));

const bcrypt = require('bcryptjs');

const { getUserByEmail, urlsForUser } = require('./helpers');

// Set ejs as the view engine
app.set("view engine", "ejs");

// Databases
const urlDatabase = {};
const users = {}

// Home
app.get('/', (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// Add routes displaying database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Add new route displaying hello styled
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Add a route displaying database
app.get('/urls', (req, res) => {
  const userID = req.session.userID;
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: userUrls, user: users[userID] };
  
  if (!userID) {
    res.statusCode = 401;
  }
  
  res.render('urls_index', templateVars);
});

// Add a new url to our db
app.post('/urls', (req, res) => {
  if (req.session.userID) {
    const longURL = req.body.longURL;
    const shortURL = Math.random().toString(36).substring(2, 8);
    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: req.session.userID
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    const errorMessage = 'Please log in!';
    res.status(401).render('urls_error', {user: users[req.session.userID], errorMessage});
  }
});


// CREATE
// Display the url => GET
// Submit the url => POST
app.get('/urls/new', (req, res) => {
  if (req.session.userID) {
    const templateVars = {user: users[req.session.userID]};
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// Render information about a single URL
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.userID;
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = { urlDatabase, userUrls, shortURL, user: users[userID] };

  if (!urlDatabase[shortURL]) {
    const errorMessage = 'This short URL does not exist.';
    res.status(404).render('urls_error', {user: users[userID], errorMessage});
  } else if (!userID || !userUrls[shortURL]) {
    const errorMessage = 'You are not authorized to see this URL.';
    res.status(401).render('urls_error', {user: users[userID], errorMessage});
  } else {
    res.render('urls_show', templateVars);
  }
});

// POST urls/shortURL
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;

  if (req.session.userID  && req.session.userID === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect(`/urls`);
  } else {
    const errorMessage = 'You are not authorized to see the URLs.';
    res.status(401).render('urls_error', {user: users[req.session.userID], errorMessage});
  }
});

// Redirect Short URLs
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    const errorMessage = 'This short URL does not exist.';
    res.status(404).render('urls_error', {user: users[req.session.userID], errorMessage});
  }  
});

// DELETE url
// POST /urls/:shortURL/delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;

  if (req.session.userID  && req.session.userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    const errorMessage = 'You are not authorized to delete the urls.';
    res.status(401).render('urls_error', {user: users[req.session.userID], errorMessage});
  }
});

// Display login template
app.get('/login', (req, res) => {
  const templateVars = {user: users[req.session.userID]};
  res.render('login', templateVars);
});

// Add route post for login
app.post("/login", (req, res) => {
  const candidateEmail = req.body.email;
  const candidatePassword = req.body.password;

  const user = getUserByEmail(candidateEmail, users);

  if (user) {
    if (bcrypt.compareSync(candidatePassword, user.password)) {
      req.session["userID"] = user.id;
      res.redirect('/urls');
    } else {
    const errorMessage = 'Login credentials not valid.';
    res.status(401).render('urls_error', {user: users[req.session.userID], errorMessage});
    }
  } else {
    const errorMessage = 'Please register!';
    res.status(401).render('urls_error', {user: users[req.session.userID], errorMessage});
  }
});

// // Display logout
app.get('/logout', (req, res) => {
  res.redirect('/urls');
});

// Post logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Ruote to get the registration form
app.get('/register', (req, res) => {
  const templateVars = {user: users[req.session.userID]};
  res.render('registration', templateVars);
});

// Route to post data from registration form to users db
app.post('/register', (req, res) => {
  const newEmail = req.body.email;
  const newPassword = req.body.password;

  if (newEmail && newPassword) {

    if (!getUserByEmail(newEmail, users)) {
      const userID = Math.random().toString(36).substring(2, 6);
      users[userID] = {
        id: userID,
        email: newEmail,
        password: bcrypt.hashSync(newPassword, 10)
      };
      req.session["userID"] = userID;
      res.redirect('/urls');
    } else {
      const errorMessage = 'This email address is already registered.';
      res.status(400).render('urls_error', {user: users[req.session.userID], errorMessage});
    }

  } else {
    const errorMessage = 'Please enter email and/or password.';
    res.status(400).render('urls_error', {user: users[req.session.userID], errorMessage});
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
