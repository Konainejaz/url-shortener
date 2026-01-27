const express = require("express");
const router = express.Router();
const {
  sendAllUsers,
  sendUserByID,
  createNewUserView,
  editUserView,
  deleteUserView,
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
} = require("../controllers/user");
const { checkEmailExists, checkEmailExistsExceptCurrent } = require("../middlewares");

// Display all users
router.get("/", sendAllUsers);

// Display single user
router.get("/:id", sendUserByID);

// Display form to create new user
router.get("/create-user/form", createNewUserView);

// Handle create new user
router.post("/", checkEmailExists, handleCreateUser);

// Display form to edit user
router.get("/:id/edit", editUserView);

// Handle update user
router.post("/:id", checkEmailExistsExceptCurrent, handleUpdateUser);

// Display delete confirmation
router.get("/:id/delete", deleteUserView);

// Handle delete user
router.post("/:id/delete", handleDeleteUser);

module.exports = router;
