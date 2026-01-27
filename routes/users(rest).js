const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserByID,
  createNewUser,
  updateUserByID,
  deleteUserByID,
} = require("../controllers/user");
const { checkEmailExists } = require("../middlewares");

router.route("/").get(getAllUsers).post(checkEmailExists, createNewUser);

router
  .route("/:id")
  .get(getUserByID)
  .patch(updateUserByID)
  .delete(deleteUserByID);

module.exports = router;
