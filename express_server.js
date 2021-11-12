const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const PORT = 8000; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
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
    password: bcrypt.hashSync('1234', 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
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

function passLookup(password, email){
  for (let key in users){
    if(bcrypt.compareSync(password, users[key].password) && users[key].email === email) {
      return users[key].id
    }
  }
  return false
};

const urlsForUser = function (id){
  const results = {};
  const keys = Object.keys(urlDatabase);
  for (const shortURL of keys) {
    const url = urlDatabase[shortURL];
  if (url.userID === id) {
    results[shortURL]  = url.longURL
  }
 }
 return results
};




const urlDatabase = {
  "b2xVn2": {
    longURL:"http://www.lighthouselabs.ca",
    userID:"userRandomID"
},
  "9sm5xK": {
    longURL:"http://www.google.com",
     userID:"userRandomID"
}
};

app.get("/", (req, res) => {
  const id = req.cookies["user_id"]
  if (!id){
    return res.redirect("/login")
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
const id = req.cookies["user_id"]
const URLS = urlsForUser(id)

  const templateVars = {  user_id: users[req.cookies["user_id"]],urls: URLS };
  res.render("urls_index" , templateVars);
});

app.get("/urls/new", (req, res) => {
  
  const templateVars = {  user_id: req.cookies["user_id"] };
  res.render("urls_new",templateVars);
});

app.post("/urls", (req, res) => {
 
  shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, user_id: users[req.cookies["user_id"]].id} 
  res.redirect(`/urls/${shortURL}`)
});

app.get("/urls/:shortURL", (req, res) => {

  const templateVars = {  user_id: users[req.cookies["user_id"]],shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
 const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  shortURL = generateRandomString();
  delete urlDatabase[req.params.shortURL]
  res.redirect(`/urls/`)
});

app.post("/urls/:shortURL/", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL; 
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
	let password = req.body.pass
  const id = generateRandomString()
 
   if (emailLookup(email)){
     
  password = bcrypt.hashSync(password, 10);

    users[id] = { id, email, password }
    console.log(users[id])
    res.cookie("user_id", id)
    return res.redirect(`/urls`)
   } if (!email || !password) {
     return res.send("400: Email or Password Is Empty - Please Try Again")
   } else {
    return res.send("400: Email Already Exist")
   }

});

app.post("/login", (req, res) => {
  email = req.body.email
  password = req.body.pass
  const id = passLookup(password, email)
  if (id){
      res.cookie("user_id", id)
      res.redirect(`/urls`)
    } 
    return res.send("403: ERROR")
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});