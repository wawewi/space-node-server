const jwt = require('jsonwebtoken');
const User = require('../models/user');

//Check if token is genuine
const auth = async (req, res, next) => {
  try {
    //Bearer tokens will be attached to a header where key is 'Authorization; and value is `Bearer ${token}`

    //removes 'Bearer ' to get token
    const token = req.header('Authorization').replace('Bearer ', '');

    //Validates if token is genuine, if so it returns the decoded token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //After verifying token authencity, find User it belongs to - it should have same _id property and exist in the tokens array
    const user = await User.findOne({_id: decoded._id, 'tokens.token': token});
    
    if (!user) {
      throw new Error('Not authorized to perform operation')
    }

    //attach token and user to request object for following middleware
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({message: 'User is not authorized'});
  }
}

module.exports = auth;