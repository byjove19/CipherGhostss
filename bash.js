const bcrypt = require('bcrypt');

const password = 'c1pher@ghostss#'; // change this to your desired admin password

bcrypt.hash(password, 10).then(hash => {
  console.log('Your hashed password is:', hash);
});
