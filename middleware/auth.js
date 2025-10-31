const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

// This function is used as middleware to authenticate user requests
exports.auth = async (req, res, next) => {
  try {
    // Extracting JWT from request cookies, body or header
    const token =
      req.header("Authorization").replace("Bearer ", "") ||
      req.cookies.token ||
      req.body.token;

    // If JWT is missing, return 401 Unauthorized response
    if (!token) {
      return res.status(401).json({ success: false, message: `Token Missing` });
    }
    let decode;

    try {
      // Verifying the JWT using the secret key stored in environment variables
      decode = await jwt.verify(token, process.env.JWT_SECRET);
      //console.log(decode);
      // Storing the decoded JWT payload in the request object for further use
      req.user = decode;
    } catch (error) {
      // If JWT verification fails, return 401 Unauthorized response
      return res
        .status(401)
        .json({ success: false, message: "token is invalid" });
    }

    // 🔑new Verify token against DB-------------------------------
    const user = await User.findById(decode.id);
    if (!user || user.token !== token) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again",
      });
    }
    //--------------------------------------------------------------

    // If JWT is valid, move on to the next middleware or request handler
    next();
  } catch (error) {
    // If there is an error during the authentication process, return 401 Unauthorized response
    return res.status(401).json({
      success: false,
      message: `Something Went Wrong While Validating the Token`,
    });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });

    if (userDetails.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route for Admin",
      });
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `User Role Can't be Verified`,error:error.message });
  }
};

exports.checkSubscriptionStatus = async (req, res, next) => {
  try {
    const userId = req.user.id; // from auth middleware
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If user has no subscription, block access
    if (!user.subscription || user.subscription.length === 0) {
      return res.status(403).json({
        success: false,
        message: "No active subscription found, Please upgrade it to continue services",
      });
    }

    const now = new Date();
    let hasActivePlan = false;

    user.subscription.forEach((sub) => {
      let endDate =
        sub.status === "trialing" ? sub.trialEndDate : sub.planExpireDate;
      if (endDate && now <= endDate && sub.status !== "expired") {
        hasActivePlan = true;
      }
    });

    if (!hasActivePlan) {
      return res.status(403).json({
        success: false,
        message: `Your subscription plan expired. Please renew it to continue services`,
      });
    }

    // If plan expired date has passed, update status to expired
    let updated = false;
    user.subscription = user.subscription.map((sub) => {
      let endDate =
        sub.status === "trialing" ? sub.trialEndDate : sub.planExpireDate;
      if (endDate && now > endDate && sub.status !== "expired") {
        sub.status = "expired";
        sub.remainingDays = 0;
        updated = true;
      }
      return sub;
    });

    if (updated) {
      await user.save();
      //console.log("Verified")
    }

    next();
  } catch (error) {
    console.error("Error checking subscription:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while checking subscription",
    });
  }
};
