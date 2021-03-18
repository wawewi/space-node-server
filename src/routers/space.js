const express = require("express");
const Space = require("../models/space");
const auth = require("../middleware/auth");
const { ObjectId } = require("bson");
const router = express.Router();

//Create space
router.post("/spaces", auth, async (req, res) => {
  const space = new Space({ ...req.body });
  try {
    req.user.spaces.push(space._id);
    space.admins.push(req.user._id);
    space.members.push(req.user._id);
    await req.user.save();
    await space.save();
    res.status(201).send(space);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Read all spaces of a user
router.get("/spaces/me", auth, async (req, res) => {
  const _id = req.user.id;
  try {
    const spaces = await Space.find({members: req.user._id});
    res.send(spaces);
  } catch (e) {
    res.status(500).send(e);
  }
});
//Read space
router.get("/spaces/:spaceid", auth, async (req, res) => {
  const _id = req.params.spaceid;
  try {
    const space = await Space.findOne({ _id, members: req.user._id });
    if (!space) {
      return res.status(404).send();
    }
    res.send(space);
  } catch (e) {
    res.status(500).send(e);
  }
});

//Update space
router.patch("/spaces/:spaceid/update", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "description"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }
  try {
    const space = await Space.findOne({
      _id: req.params.spaceid,
      admins: req.user._id,
    });
    //TODO: Test non-admin users cannot apply update
    //TODO: Add member, add admin - checking if it exists already
    if (!space) {
      return res.status(404).send({error: "Insufficient permissions or Space not found"});
    }
    updates.forEach((update) => (space[update] = req.body[update]));
    await space.save();
    res.send({message: "Successfully updated space",space});
  } catch (e) {
    res.status(400).send(e);
  }
});

//Delete space
router.delete("/spaces/:spaceid/delete", auth, async (req, res) => {
  try {
    const space = await Space.findOneAndDelete({
      _id: req.params.spaceid,
      admins: req.user._id,
    });
    //spaceid is stored as a number on user.spaces, req.params.spaceid is a string
    const index = req.user.spaces.findIndex((spaceid)=>spaceid==req.params.spaceid);
    req.user.spaces.splice(index,1);
    await req.user.save();
    if (!space) {
      res.status(404).send({error: "Space not found"});
    }
    res.send({message:'Space successfully deleted', space});
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
