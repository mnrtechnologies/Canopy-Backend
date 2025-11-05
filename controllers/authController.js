const bcrypt = require("bcrypt"); //authController.js
const crypto = require("crypto");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
// Models
const User = require("../models/User");


const validatePassword = (password) => {
  const isValidLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return (
    isValidLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar
  );
};

// Login controller for authenticating users
// exports.login = async (req, res) => {
//   try {
//     // Get email and password from request body
//     const { email, password, otp } = req.body;

//     // Check if email or password is missing
//     if (!email || !password || !otp) {
//       // Return 400 Bad Request status code with error message
//       return res.status(400).json({
//         success: false,
//         message: `Please Fill up All the Required Fields`,
//       });
//     }

//     // Find user with provided email
//     const user = await User.findOne({ email });

//     // If user not found with provided email
//     if (!user) {
//       // Return 401 Unauthorized status code with error message
//       return res.status(401).json({
//         success: false,
//         message: `User is not Registered with Us Please SignUp to Continue`,
//       });
//     }

//     // Find the most recent OTP for the email
//     const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
//     // console.log(response);
//     if (response.length === 0) {
//       // OTP not found for the email
//       return res.status(400).json({
//         success: false,
//         message: "The OTP is not valid",
//       });
//     } else if (otp !== response[0].otp) {
//       // Invalid OTP
//       return res.status(400).json({
//         success: false,
//         message: "The OTP is not valid",
//       });
//     }

//     // Generate JWT token and Compare Password
//     if (await bcrypt.compare(password, user.password)) {
//       const payload = {
//         email: user.email,
//         id: user._id,
//       };

//       const token = jwt.sign(payload, process.env.JWT_SECRET, {
//         expiresIn: "24h",
//       });

//       // Save token to user document in database
//       user.token = token;

//       await user.save(); //new updated code Save token to user document in database

//       user.password = undefined;

//       // Set cookie for token and return success response
//       const options = {
//         expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
//         httpOnly: true,
//       };

//       res.cookie("token", token, options).status(200).json({
//         success: true,
//         token,
//         user,
//         message: `User Login Success`,
//       });
//     } else {
//       return res.status(401).json({
//         success: false,
//         message: `Password is incorrect`,
//       });
//     }
//   } catch (error) {
//     //console.error(error)
//     // Return 500 Internal Server Error status code with error message
//     return res.status(500).json({
//       success: false,
//       message: `Login Failure Please Try Again`,
//     });
//   }
// };

// Login controller for authenticating users

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password ) {
      return res.status(400).json({
        success: false,
        message: `Please fill all required fields.`,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: `User is not registered.`,
      });
    }

    // 🔑 Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: `Password is incorrect`,
      });
    }

    // ✅ Generate token
    const payload = { email: user.email, id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });

    user.token = token;
    await user.save();

    user.password = undefined;

    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.cookie("token", token, options).status(200).json({
      success: true,
      token,
      user,
      message: `User login successful`,
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: `Login failed. Please try again.`,
    });
  }
};


// Send OTP For Email Verification
exports.sendotp = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user is already present
    // Find user with provided email
    const checkUserPresent = await User.findOne({ email });
    // to be used in case of signup

    // If user found with provided email
    if (!checkUserPresent) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: `User is not Registered`,
      });
    }

    if (!(await bcrypt.compare(password, checkUserPresent.password))) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const result = await OTP.findOne({ otp: otp });
    console.log("Result is Generate OTP Func");
    console.log("OTP", otp);
    console.log("Result", result);
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
    }
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    console.log("OTP Body", otpBody);

    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Edit User Details by ID
exports.editUser = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming auth middleware adds req.user
    const { name, role, studentClass } = req.body;

    // Validate input
    if (!name && !role) {
      return res.status(400).json({
        success: false,
        message: "At least one field (name or role) is required to update",
      });
    }

    // Prepare update object dynamically
    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (role) updatedFields.role = role;
    if (studentClass) updatedFields.class = studentClass;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select("-password -token");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "User details updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating user details",
    });
  }
};

// Get All Users (excluding passwords)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    // If no users found
    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }

    // Return the user list
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Edit User Details by ID
exports.editUserAdmin = async (req, res) => {
  try {
    const { userId } = req.params; // user ID from URL params
    const { name, email, role } = req.body; // fields to update

    if (!name && !email && !role) {
      return res.status(400).json({
        success: false,
        message: "At least one field (name, email, role) is required to update",
      });
    }

    // Update user (exclude password updates here)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { name, email, role } },
      { new: true, runValidators: true, select: "-password" }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User details updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating user details",
      error: error.message,
    });
  }
};

// Delete User by ID
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// Register Controller for Registering USers
exports.register = async (req, res) => {
  try {
    // Destructure fields from the request body
    const { name, email, password, confirmPassword, role } = req.body;
    // Check if All Details are there or not
    if (!name || !email || !password || !confirmPassword) {
      return res.status(403).send({
        success: false,
        message: "All Fields are required",
      });
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password do not match. Please try again.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate trial end date: today + 14 days
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role
    });

    return res.status(200).json({
      success: true,
      user,
      message: "User registered successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};

// Get user details using token (after auth middleware)
// exports.getUserDetails = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const user = await User.findById(userId).select("-password -token");

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       user,
//       message: "User details fetched successfully",
//     });
//   } catch (error) {
//     console.error("Error fetching user:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error while fetching user",
//     });
//   }
// };

exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    let user = await User.findById(userId).select("-password -token");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
      message: "User details fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching user",
    });
  }
};

//get user by id bodyuserid
exports.getUserDetailsById = async (req, res) => {
  try {
    const userId = req.body.userid;

    let user = await User.findById(userId).select("-password -token");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
      message: "User details fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching user",
    });
  }
};

//Controller for Changing Password
exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id);

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body;

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The old password is incorrect" });
    }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.name}`
        )
      );
      console.log("Email sent successfully:", emailResponse.response);
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      });
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};

exports.updateImage = async (req, res) => {
  try {
x
    const userId = req.user.id;
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    console.log(image);
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    );
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateBasicInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const updatedData = {};

    // Conditionally update name if it's non-empty
    if (req.body.name && req.body.name.trim() !== "") {
      updatedData.name = req.body.name.trim();
    }

    // Conditionally update email if it's non-empty
    if (req.body.email && req.body.email.trim() !== "") {
      updatedData.email = req.body.email.trim();
    }

    // If no valid fields provided
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


