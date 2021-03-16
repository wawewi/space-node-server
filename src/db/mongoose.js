const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, {
  useUnifiedTopology: true,
  useCreateIndex: true, 
});

const User = mongoose.model('User', {
  name: {
    type: String,
  },
  age: {
    type: Number,
  }
})

const user1 = new User({
  name: 'Weng',
  age: 27,
})

user1.save().then(console.log).catch(console.log);
