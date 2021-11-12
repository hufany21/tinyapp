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
    if(users[key].password === password && users[key].email === email) {
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

module.exports = 
  passLookup(),
  urlsForUser(),
  generateRandomString(),
  emailLookup()
;