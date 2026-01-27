const User = require("../models/users");
const {
  generateUserTable,
  generateCreateUserForm,
  generateEditUserForm,
  generateDeleteConfirmation,
  toastMessageView
} = require("../views/users");

const sendAllUsers = async (req, res) => {
  const results = await User.find({});
  res.send(generateUserTable(results, "Users"));
};
const sendUserByID = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = await User.findOne({ id: userId });
  if (user) {
    res.send(generateUserTable(user, `User ID: ${userId}`));
  } else {
    res.status(404).send(toastMessageView("User not found", "error"));
  }
};
const getAllUsers = async (req, res) => {
  res.setHeader("x-my-name", "Quonain Ejaz");
  res.setHeader("Content-Length", "USA");
  const results = await User.find({});
  res.status(200).json(results);
};

const getUserByID = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = await User.findOne({ id: userId });
  if (user) {
    res.json(user);
  } else {
    res.status(404).json("User not found");
  }
};

const createNewUser = async (req, res) => {
  const newUser = req.body;
  if (
    !newUser.first_name ||
    !newUser.last_name ||
    !newUser.email ||
    !newUser.gender ||
    !newUser.job_title
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Generate ID for new user
    const maxId = Math.max(...(await User.find({})).map((u) => u.id), 0);
    newUser.id = maxId + 1;

    const result = await User.create({
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      gender: newUser.gender,
      job_title: newUser.job_title,
      id: newUser.id,
    });

    res.status(201).json({ status: "success", user: result });
  } catch (err) {
    console.error("Error creating user:", err);
    res
      .status(500)
      .json({ error: err?.errorResponse?.errmsg || "Internal Server Error" });
  }
};

const handleCreateUser = async (req, res) => {
  const newUser = req.body;
  if (
    !newUser.first_name ||
    !newUser.last_name ||
    !newUser.email ||
    !newUser.gender ||
    !newUser.job_title
  ) {
    return res.status(400).send(toastMessageView("All fields are required", "error"));
  }

  try {
    // Generate ID for new user
    const maxId = Math.max(...(await User.find({})).map((u) => u.id), 0);
    newUser.id = maxId + 1;

    await User.create({
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      gender: newUser.gender,
      job_title: newUser.job_title,
      id: newUser.id,
    });

    res.redirect("/users");
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).send(toastMessageView("Failed to create user: " + err.message, "error"));
  }
};

const createNewUserView = (req, res) => {
  res.send(generateCreateUserForm());
};

const updateUserByID = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const updates = req.body;
  const user = await User.findOne({ id: userId });
  if (user) {
    await User.updateOne({ id: userId }, { $set: updates });
    const updatedUser = await User.findOne({ id: userId });
    res.json({ status: "success", user: updatedUser });
  } else {
    res.status(404).json({ error: "User not found" });
  }
};

const handleUpdateUser = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const updates = req.body;
  const user = await User.findOne({ id: userId });
  if (user) {
    await User.updateOne({ id: userId }, { $set: updates });
    res.redirect("/users");
  } else {
    res.status(404).send(toastMessageView("User not found", "error"));
  }
};

const editUserView = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = await User.findOne({ id: userId });
  if (user) {
    res.send(generateEditUserForm(user));
  } else {
    res.status(404).send(toastMessageView("User not found", "error"));
  }
};

const deleteUserByID = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = await User.findOne({ id: userId });
  if (user !== null) {
    const result = await User.deleteOne({ id: userId });
    if (!result) {
      console.error("Error writing to file:", err);
      res.status(500).json({ error: "Failed to delete user" });
    } else {
      res.json({ status: "success" });
    }
  } else {
    res.status(404).json({ error: "User not found" });
  }
};

const deleteUserView = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = await User.findOne({ id: userId });
  if (user) {
    res.send(generateDeleteConfirmation(user));
  } else {
    res.status(404).send(toastMessageView("User not found", "error"));
  }
};

const handleDeleteUser = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = await User.findOne({ id: userId });
  if (user) {
    await User.deleteOne({ id: userId });
    res.redirect("/users");
  } else {
    res.status(404).send(toastMessageView("User not found", "error"));
  }
};

module.exports = {
  sendAllUsers,
  sendUserByID,
  getAllUsers,
  getUserByID,
  createNewUser,
  updateUserByID,
  deleteUserByID,
  handleCreateUser,
  createNewUserView,
  handleUpdateUser,
  editUserView,
  deleteUserView,
  handleDeleteUser,
};
