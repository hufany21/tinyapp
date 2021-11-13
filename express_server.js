const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync('1234', 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync('1234', 10)
  }
};

const generateRandomString = function() { //creates random sting for id
  let ranId = (Math.random() + 1).toString(36).substring(7);
  return ranId;
};

const emailLookup = function(email) { //checks if email exists in users
  for (let key in users) {
    if (users[key].email === email) {
      return false;
    }
  }
  return true;
};

const passLookup = function(password, email) {  // checks if password matches database and if both email and password match
  for (let key in users) {
    if (bcrypt.compareSync(password, users[key].password) && users[key].email === email) {
      return users[key].id;
    }
  }
  return false;
};

const urlsForUser = function(id) {     //checks if user matchers urls and creats object with lond and short URLs
  const results = {};
  const keys = Object.keys(urlDatabase);
  for (const shortURL of keys) {
    const url = urlDatabase[shortURL];
    if (url.user_id === id) {
      results[shortURL]  = url.longURL;
    }
  }
  return results;
};


const urlDatabase = {
  "b2xVn2": {
    longURL:"http://www.lighthouselabs.ca",
    user_id:"userRandomID"
  },
  "9sm5xK": {
    longURL:"http://www.google.com",
    user_id:"userRandomID"
  }
};

app.get("/", (req, res) => {      //redirect page, nodody ends up here
  const id = req.session.user_id;
  if (!id) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const URLS = urlsForUser(id);
  const templateVars = {  user_id: users[req.session.user_id] , urls: URLS }; //send URLS to ejs
  res.render("urls_index" , templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {  user_id: users[req.session.user_id]  };
  res.render("urls_new",templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, user_id: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});


app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {     //not logged in
    return res.send("Please login to see this information");
  }
  if (urlDatabase[req.params.shortURL].user_id !== req.session.user_id) {  ///wrong user_id
    return res.send("You dont have permisson to view this url");
  }
  const templateVars = {  user_id: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;//uses param to look up longURL and redirect accordingly
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls/`);
});

app.post("/urls/:shortURL/", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  const templateVars = { user_id: req.session.user_id};
  res.render("urls_login", templateVars);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

app.get("/register", (req, res) => {
  const templateVars = { user_id: users[req.session.user_id] };
  res.render("urls_register", templateVars);
});


app.post("/register", (req, res) => {
  const email = req.body.email;
  let password = req.body.pass;
  const id = generateRandomString();
  if (emailLookup(email)) {
    password = bcrypt.hashSync(password, 10);   //hash password
    users[id] = { id, email, password };     //add registered user to database
    req.session.user_id = id;
    return res.redirect(`/urls`);
  } if (!email || !password) {   //if either are not there, display error
    return res.send("400: Email or Password Is Empty - Please Try Again");
  } else {
    return res.send("400: Email Already Exist");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.pass;
  const id = passLookup(password, email);//ensure password and email match
  if (id) {
    req.session.user_id = id;       //assign cookie
    res.redirect(`/urls`);
  }
  return res.send("403: ERROR");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});