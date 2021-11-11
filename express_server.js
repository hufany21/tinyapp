const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const PORT = 8000; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

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

function generateRandomString() {
  let ranId = (Math.random() + 1).toString(36).substring(7);
  return ranId;
}

function emailLookup(email){
  for (let key in users){
    if(users[key].email === email){
      return false
    }
  }
  return true
};

function passLookup(password){
  for (let key in users){
    if(users[key].password === password && users[key].email === email) {
      return users[key]
    }
  }
  return false
};






const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {  user_id: req.cookies["user_id"],urls: urlDatabase };
  res.render("urls_index" , templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {  user_id: req.cookies["user_id"] };
  res.render("urls_new",templateVars);
});

app.post("/urls", (req, res) => {
  shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;  
  res.redirect(`/urls/${shortURL}`)
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {  user_id: req.cookies["user_id"],shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
 const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  shortURL = generateRandomString();
  delete urlDatabase[req.params.shortURL]
  res.redirect(`/urls/`)
});

app.post("/urls/:shortURL/", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL; 
  res.redirect(`/urls`)
});

app.get("/login", (req, res) => {
  const templateVars = { user_id: req.cookies["user_id"]}
  res.render("urls_login", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect(`/urls`)
});

app.get("/register", (req, res) => {
  const templateVars = { user_id: req.cookies["user_id"]}
  res.render("urls_register", templateVars);
});


app.post("/register", (req, res) => {
  const email = req.body.email
	const password = req.body.password
  const id = generateRandomString()
 
   if (emailLookup(email)){
    users[id] = { id, email, password }
    res.cookie("user_id", id)
    res.redirect(`/urls`)
   } if (email === "" || password === "") {
     return res.send("400: ERROR")
   } else {
    return res.send("400: ERROR")
   }

});

app.post("/login", (req, res) => {
  email = req.body.email
  password = req.body.password
  if (passLookup(password)){
    const id = passLookup(password)
      res.cookie("user_id", id)
      res.redirect(`/urls`)
    } 
    return res.send("403: ERROR")
});

 // const id = req.cookies[user_id]
  // const email = users[id][email]

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});