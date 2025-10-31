const express = require("express")
const router = express.Router();
const { login,updateBasicInfo,changePassword,deleteUser,updateImage, getUserDetails, editUser, getUserDetailsById, sendotp, getAllTeachers, editUserAdmin,  getAllUsers, register} = require("../controllers/authController")
const {auth,isAdmin} = require("../middleware/auth");
const { resetPasswordToken, resetPassword } = require("../controllers/resetPasswordController");

router.post("/login",login)
router.get("/get-user",auth,getUserDetails)
router.post("/get-user-by-id",getUserDetailsById)
router.put("/edit-user", auth, editUser);

// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken)

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword)

router.post("/sendotp", sendotp)

//admin-----------------------------------------
// Route for user signup
router.post("/register", register)

//get all user details
router.get("/get-all-user-details",auth,isAdmin,getAllUsers)

// Edit User Details
router.put("/edit-user/:userId", auth, isAdmin, editUserAdmin);

// // Route for Changing the password
router.put("/change-password",auth,changePassword)

//Profile image
router.put("/update-image",auth,updateImage)

//update basic name, email
router.put("/update-info",auth,updateBasicInfo);


// Delete User
router.delete("/delete-user/:userId", auth, isAdmin, deleteUser);
//-------------------------------------------------------------------

module.exports = router