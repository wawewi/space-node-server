const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const {testUserAdminId, testUserAdmin, setUpDatabase} = require('./fixtures/db');
const bcrypt = require('bcryptjs');

beforeEach(setUpDatabase);

test('Should create a user', async ()=> {
  const response = await request(app)
    .post('/users').send({
      username: 'wonston',
      email: 'wonston@test.com',
      password: 'testing',
    })
    .expect(201);

  //Assert that database has new user
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  //Assert that database has correct details of new user
  expect(response.body).toMatchObject({
    user: {
      username: 'wonston',
      email: 'wonston@test.com',
    },
    token: user.tokens[0].token,
  })
})

test('Should not create user', async ()=> {
  await request(app)
    .post('/users')
    .send({
      username: 'winstonlim',
      password: 'testing',
    }).expect(400);
  await request(app)
    .post('/users')
    .send({
      email: 'maple@test.com',
      password: 'testing',
    }).expect(400);
})

test('Should sign in user', async ()=> {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: testUserAdmin.email,
      password: testUserAdmin.password,
    })
    .expect(200);
  //Assert that user sucessfully logged in
  const user = await User.findById(testUserAdminId);
  expect(response.body.token).toBe(user.tokens[1].token);
})

test('Should not sign in', async ()=> {
  await request(app).post('/users/login')
  .send({
    email: 'test@test.com',
    password: 'badpass'})
  .expect(400);
})

test('Should logout user', async()=> {
  await request(app)
    .post('/users/logout')
    .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
    .send({})
    .expect(200);
  //Assert token was removed
  const user = await User.findById(testUserAdminId);
  expect(user.tokens.length).toBe(0);
})

test('Should not logout user', async ()=> {
  await request(app)
    .post('/users/logout')
    .send({})
    .expect(401);
})

test('Should logout all users', async ()=> {
  await request(app)
    .post('/users/logoutAll')
    .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
    .send({})
    .expect(200);
  //Assert all tokens were removed
  const user = await User.findById(testUserAdminId);
  expect(user.tokens.length).toBe(0);
})

test('Should not logout all users', async ()=> {
  await request(app)
    .post('/users/logoutAll')
    .send({})
    .expect(401);
})

test('Shoud read user', async ()=> {
  const response = await request(app)
  .get('/users/me')
  .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
  .send({})
  .expect(200);
  //Assert correct user is returned
  const user = User.findById(testUserAdminId);
  expect(response.body).toMatchObject({
    email: testUserAdmin.email,
    username: testUserAdmin.username,
  });
})

test('Should not read user', async ()=> {
  await request(app)
  .get('/users/me')
  .send({})
  .expect(401);
})

test('Should update user fields', async () => {
  await request(app)
  .patch('/users/me')
  .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
  .send({
    username: 'Updated tester'
  }).expect(200)
  //Assert username was updated
  const username = await User.findById(testUserAdminId);
  expect(username.username).toEqual('Updated tester');
  await request(app)
  .patch('/users/me')
  .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
  .send({
    email: 'testedUpdate@test.com'
  }).expect(200)
  const email = await User.findById(testUserAdminId);
  expect(email.email).toEqual('testedUpdate@test.com'.toLowerCase());
  await request(app)
  .patch('/users/me')
  .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
  .send({
    password: 'updatedTest'
  }).expect(200)
  const password = await User.findById(testUserAdminId);
  const isMatch = await bcrypt.compare('updatedTest', password.password);
  expect(isMatch).toEqual(true);
})

test('Should not update user', async () => {
  await request(app)
  .patch('/users/me')
  .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
  .send({
    location: 'Singapore'
  }).expect(400)
  await request(app)
  .patch('/users/me')
  .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
  .send({
    tokens: 'Singapore'
  }).expect(400)
  await request(app)
  .patch('/users/me')
  .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
  .send({
    spaces: [],
  }).expect(400)
  await request(app)
  .patch('/users/me')
  .send({
    username: 'Singapore'
  }).expect(401)
})

test('Should upload avatar image', async ()=> {
  await request(app)
  .post('/users/me/avatar')
  .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
  .attach('avatar','tests/fixtures/profile-pic.jpg')
  .expect(200);
  //Assert that avatar binary data was stored
  const user = await User.findById(testUserAdminId);
  expect(user.avatar).toEqual(expect.any(Buffer));
})

test('Should not upload avatar image', async ()=> {
  //Unauthenticated
  await request(app)
  .post('/users/me/avatar')
  .attach('avatar','tests/fixtures/profile-pic.jpg')
  .expect(401);
  //Wrong file type
  await request(app)
  .post('/users/me/avatar')
  .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
  .attach('avatar','tests/fixtures/NodeJs.pdf')
  .expect(500);
  //Exceed file upload limit
  await request(app)
  .post('/users/me/avatar')
  .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
  .attach('avatar','tests/fixtures/26mb.jpg')
  .expect(500);
})

test('Should delete avatar', async ()=> {
  const user = await User.findById(testUserAdminId);
  user.avatar = Buffer.from('This is a test');
  await user.save();
  await request(app)
    .delete('/users/me/avatar')
    .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
    .send({})
    .expect(200);
  const updatedUser = await User.findById(testUserAdminId);
  expect(updatedUser.avatar).toBe(undefined);
})

test('Should not delete avatar', async ()=> {
  await request(app)
    .delete('/users/me/avatar')
    .send({})
    .expect(401);
  await request(app)
    .delete('/users/me/avatar')
    .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
    .send({})
    .expect(400);
})

test("Should delete a user", async ()=> {
  await request(app)
  .delete('/users/me')
  .set('Authorization', `Bearer ${testUserAdmin.tokens[0].token}`)
  .send({})
  .expect(200);
  
  //Assert that user was removed from Database
  const user = await User.findById(testUserAdminId);
  expect(user).toBeNull();
})

test("Should not delete user", async ()=> {
  await request(app)
  .delete('/users/me')
  .send({})
  .expect(401);
})

