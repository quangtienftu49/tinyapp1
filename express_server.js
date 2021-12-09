const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());



// Set ejs as the view engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

// Add routes displaying database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Add new route displaying hello styled
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// add a route displaying database
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// CREATE
// Display the url => GET
// Submit the url => POST
app.get("/urls/new", (req, res) => {
  // const user_Id = req.cookies.user_Id;
  // const templateVars = {userId: user_Id}
  res.render("urls_new");
});

// Render information about a single URL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]

  const templateVars = { shortURL: shortURL, longURL: longURL };
  res.render("urls_show", templateVars);
});

// add a new url to our db
app.post('/urls', (req, res) => {
  // Extract the new url from the form post
  // Body parser => req.body
  // form info = req.body
  const longURL = req.body.longURL;

  // generate an exclusive shortURL
  // save it in the database
  const shortURL = Math.random().toString(36).substring(2, 8);

  // adding a new key-value pair to our db
  // objectName[newKey] = value;
  urlDatabase[shortURL] = longURL;

  // redirect to /u/:shortURL
  res.redirect('/urls');
  // res.redirect('/u/' + shortURL);
});

// Redirect Short URLs
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];

  res.redirect(longURL);
});


// DELETE
// POST /urls/:shortURL/delete
app.post('/urls/:shortURL/delete', (req, res) => {

  // extract the shortURL from the url
  const shortURL = req.params.shortURL;

  delete urlDatabase[shortURL];

  res.redirect('/urls');

});

// EDIT 
// GET /urls/shortURL
// POST /urls/shortURL

app.get('/urls/:shortURL', (req, res) => {

  // extract the info from the url => req.params

  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];

  const templateVars = {shortURL: shortURL, longURL: longURL};

  console.log(templateVars);

  res.render('urls_show', templateVars);

});

app.post('/urls/:shortURL', (req, res) => {

  // Exract the info from the form => req.body
  const longURL = req.body.longURL;

  // extract the shortURL from the url => req.params
  const shortURL = req.params.shortURL;

  // Update the new url in the db
  urlDatabase[shortURL] = longURL;

  // redirect /urls
  res.redirect('/urls');

});

// Display login template
app.get('/login', (req, res) => {
  res.render('login');
});

// Add route for login
app.post('/login', (req, res) => {

  const candidateEmail = req.body.email;
  const candidatePassword = req.body.password;

  for (const user in users) {
    if (users[user].email === candidateEmail) {
      if (users[user].password === candidatePassword) {
        // LOGIN! SET A COOKIE:
        res.cookie('user_Id', user_Id);
        // res.redirect('/urls')
      } else {
        res.write("Status code: 403. Password is not matching.");
        res.end();
        return;
      }
    } else {
      res.write("Status code: 403. Email is not found.");
      res.end();
      return;
    }
  }
});

// display profile template
app.get('/profile', (req, res) => {
  if (req.cookies.user_Id) {
    res.render('profile');
  } else {
    res.write('Not logged in.');
    res.end();
    return;
  }
  
});

// display logout
app.get('/logout', (req, res) => {
  res.clearCookie('user_Id')
  res.redirect('/urls')
});

// // Post to logout
app.post('/logout', (req, res) => {
  // const user_Id = req.cookies.user_Id; 
  // res.render('_header');
});

// Ruote to get the registration form
app.get('/register', (req, res) => {
  res.render('registration');
});

// Route to post data from registration form to users db
app.post('/register', (req, res) => {

  const newEmail = req.body.email;
  const newPassword = req.body.password;

  // generate random user ID and set to cookie
  const user_Id = Math.random().toString(36).substring(2, 6);

  if (newEmail.length === 0 || newPassword.length === 0) {
    res.write("Status code: 400. Please enter email and/or password");
    // res.end();
    // return;
  } else if (newEmail.length > 0 && newPassword.length > 0){
    for (const user in users) {
      if (users[user].email === newEmail) {
        res.write("Status code: 400. Email is used.");
        // res.end();
        // return;
      } else {
        res.cookie('user_Id', user_Id)
        users[user_Id] = {
          id: user_Id,
          email: newEmail,
          password: newPassword
        }
      }
    }
  }

  console.log(users)
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
