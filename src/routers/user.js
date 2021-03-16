const express = require('express')
const User = require('../models/user');
const auth = require('../middleware/auth');
const sharp = require('sharp');
const multer = require('multer');

const router = express.Router();

//-----Public routes
//Registers User
router.post('/users', async (req,res)=> {
  const user = new User(req.body);
  try {
    await user.save();
    await User.login(req.body.email, req.body.password);
    const token = await user.generateAuthtoken();
    res.status(201).send({user});
  } catch (e) {
    res.status(400).send();
  }
})
//Login User
router.post('/users/login', async (req,res)=> {
  try {
    const user = await User.login(req.body.email, req.body.password);
    const token = await user.generateAuthtoken();
    res.send({user});
  } catch(e) {
    res.status(400).send();
  }
})

//-----Private routes
//Logout user
router.post('/users/logout', auth, async (req,res)=> {
  try {
    req.user.tokens = req.user.tokens.filter((element)=>element.token!==req.token);
    await req.user.save();
    res.send({message: 'Logout successful'});
  } catch(e) {
    response.status(500).send();
  }
})
//Logout all devices for user
router.post('/users/logoutAll', auth, async (req,res)=> {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send({message: 'Logout of all devices successfully'})
  } catch (e) {
    res.status(500).send();
  }
})
//Fetch current user
router.post('/users/me', auth, async (req,res)=> {
  res.send(req.user);
})
//Update current user
router.patch('/users/me', async (req,res)=> {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['username', 'email', 'password', 'avatar'];
})
