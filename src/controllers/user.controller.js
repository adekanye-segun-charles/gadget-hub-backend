const userService = require("../services/user.service");


const getMe = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};


const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(
      req.user.userId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};


const changePassword = async (req, res, next) => {
  try {
    const result = await userService.changePassword(
      req.user.userId,
      req.body.currentPassword,
      req.body.newPassword
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


const deleteMyAccount = async (req, res, next) => {
  try {
    const result = await userService.deleteMyAccount(
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getMe,
  updateProfile,
  changePassword,
  deleteMyAccount,
};