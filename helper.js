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
console.log(users.userRandomID.email)


function emailLookup(email){
  for (let key in users){
    if(users[key].email === email){
      return "400: User Already Exist in Database"
    }
  }
  return true
};

console.log(emailLookup('user2@example.com'))



