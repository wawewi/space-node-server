const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user');
const Space = require('../../src/models/space');

const testUserAdminId = new mongoose.Types.ObjectId();
const testUserAdmin = {
  _id: testUserAdminId,
  username: 'tester',
  email: 'test@test.com',
  password: 'testing',
  tokens: [{
    token: jwt.sign({_id: testUserAdminId}, process.env.JWT_SECRET),
  }],
}

const testSpace = {
  name: 'testSpace',
  description: 'This is a test space',
  admins: [testUserAdminId],
  members: [testUserAdminId],
  memories: [],
}

const setUpDatabase = async () => {
  await User.deleteMany();
  await new User(testUserAdmin).save();
  await Space.deleteMany();
  await new Space(testSpace).save();
}

module.exports = {
  testUserAdminId,
  testUserAdmin,
  setUpDatabase,
}
