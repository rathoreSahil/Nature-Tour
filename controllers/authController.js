const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AppError = require('./../utils/appError');
const { promisify } = require('util');
const Email = require('./../utils/email');
const crypto = require('crypto');

exports.createSendToken = (user, statusCode, res, isGoogleLogin) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  user.password = undefined;
  res.cookie('jwt', token, cookieOptions);

  if (isGoogleLogin) {
    return res.redirect('/');
  } else {
    res.status(statusCode).json({
      status: 'success',
      token,
      data: user,
    });
  }
};

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE * 1000,
  });
};

exports.protect = async (req, res, next) => {
  try {
    // 1)getting token and check if its there
    // console.log(req.headers.authorization);
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'please login to get access',
      });
    }

    // 2)Verification of token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3)Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'user not found',
      });
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'fail',
        message: 'password changed,please login again!',
      });
    }

    // 5) Grant access
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.isLoggedIn = async (req, res, next) => {
  // console.log(req.cookies);
  if (req.cookies) {
    try {
      // 2)Verification of token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 3)Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 4) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // 5) Grant access
      res.locals.user = currentUser;
      req.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  this.createSendToken(newUser, 201, res);
});

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        status: 'fail',
        message: 'Please enter username and password',
      });
    }

    const user = await User.findOne({ email: email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect username or password',
      });
    }

    this.createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.cookie('jwt', 'loggedOut', {
      expires: new Date(Date.now() + 10000),
      httpOnly: true,
    });
    res.status(200).json({
      status: 'success',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // const roles = ['admin', 'lead-guide'];

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You dont have permission',
      });
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  try {
    // 1)Finding user
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'User does not exist,email does not match with our database.',
      });
    }

    // 2)Generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3)send it to users email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `To reset the password Click on this URL :  ${resetURL}`;
    try {
      // await sendEmail({
      //   email: user.email,
      //   subject: 'password reset token',
      //   text: message,
      // });

      await new Email(user, resetURL).sendPasswordReset();

      res.status(200).json({
        status: 'success',
        message: 'token sent',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(403).json({
        status: 'fail',
        message: err,
      });
    }
  } catch (err) {
    return res.status(403).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  // 1)get user based on token
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(403).json({
      status: 'fail',
      message: 'token invalid or expired',
    });
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  this.createSendToken(user, 200, res);
};

exports.updatePassword = async (req, res, next) => {
  try {
    // 1) get user
    const user = await User.findById(req.user.id).select('+password');

    // 2) check if posted password is correct
    if (!(await user.correctPassword(req.body.password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect password',
      });
    }

    // 3) if so, update password

    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;

    await user.save();

    // 4) log user in, send JWT
    this.createSendToken(user, 200, res);
  } catch (err) {
    return res.status(403).json({
      status: 'fail',
      message: err,
    });
  }
};
