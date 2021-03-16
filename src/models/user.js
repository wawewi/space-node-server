const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { nextTick } = require('node:process');

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String, 
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      }
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(value) {
        if(value.toLowerCase().includes('password')) {
          throw new Error('Password contains \'password\'');
        }
      }
    },
    tokens: [{
      token: {
        type: String,
        required: true,
      }
    }],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
)


userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat(token);
  await user.save();
  return token;
}

//Custom return object
userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  return userObject;
}

//Static login method for reusability
userSchema.statics.login = async(email,password)=> {
  //Check if user exists
  const user = User.findOne({email});
  if (!user) {
    throw new Error('Unable to login user');
  }

  //Check credentials
  const isMatch = bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Incorrect credentials');
  }

  return user;
}

//Hashes passwords before user.save() is called - Registration, Login, Update
userSchema.pre('save', async(next)=> {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
})

//Remove documents that exist in other collections that belong to user
userSchema.pre('remove', async(next)=> {
  next();
})

//Creates a User model that will be saved in a 'User' collection
const User = mongoose.model('User', userSchema);

module.exports = User;