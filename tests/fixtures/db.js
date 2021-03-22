const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user');

const testUserId = new mongoose.Types.ObjectId();
const testUser = {
  _id: testUserId,
  username: 'tester',
  email: 'test@test.com',
  password: 'testing',
  tokens: [{
    token: jwt.sign({_id: testUserId}, process.env.JWT_SECRET),
  }],
}

const setUpDatabase = async () => {
  await User.deleteMany();
  const response = await new User(testUser).save();
}

module.exports = {
  testUserId,
  testUser,
  setUpDatabase,
}
