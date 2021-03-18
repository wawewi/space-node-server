const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const sharp = require("sharp");
const multer = require("multer");

const router = express.Router();

//-----Public routes
//Registers User
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    await User.login(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});
//Login User
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.login(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});
//Get avatar
router.get("/users/:userid/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.userid);
    if (!user || !user.avatar) {
      throw new Error("User does not exist or has no avatar");
    }
    //sets response type png instead of default json
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

//-----Private routes
//Logout user
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (element) => element.token !== req.token
    );
    await req.user.save();
    res.send({ message: "Logout successful" });
  } catch (e) {
    response.status(500).send();
  }
});
//Logout all devices for user
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send({ message: "Logout of all devices successfully" });
  } catch (e) {
    res.status(500).send();
  }
});
//Read current user
router.get("/users/me", auth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});
//Update current user
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["username", "email", "password"];
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).send("Invalid updates");
  }
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});
//Delete current user
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send({ message: "User removed successfully" });
  } catch (e) {
    res.status(500).send();
  }
});
const upload = multer({
  limits: {
    fileSize: 10000000,
  },
  fileFilter(request, file, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(new Error("Unsupported file type(s)"));
    }
    callback(undefined, true);
  },
});
//Create/update avatar
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const buffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer();
      req.user.avatar = buffer;
      await req.user.save();
      res.send({ message: "Avatar updated" });
    } catch (e) {
      res.status(400).send(e.message);
    }
  }
);
//Delete avatar
router.delete("/users/me/avatar", auth, async (req, res) => {
  if (!req.user.avatar) {
    return res.status(400).send({ message: "Avatar does not exist" });
  }
  req.user.avatar = undefined;
  await req.user.save();
  res.send({ message: "Avatar removed!" });
});

module.exports = router;
