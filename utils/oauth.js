const { default: axios } = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { createSendToken } = require('../controllers/authController');

getGoogleOauthURL = () => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

  const options = {
    redirect_uri: process.env.OAUTH_REDIRECT_URL_GOOGLE,
    client_id: process.env.OAUTH_CLIENT_ID_GOOGLE,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const qs = new URLSearchParams(options);

  return `${rootUrl}?${qs.toString()}`;
};

const getGoogleOauthTokens = async (code) => {
  const rootUrl = 'https://oauth2.googleapis.com/token';

  const values = {
    code,
    client_id: process.env.OAUTH_CLIENT_ID_GOOGLE,
    client_secret: process.env.OAUTH_CLIENT_SECRET_GOOGLE,
    redirect_uri: process.env.OAUTH_REDIRECT_URL_GOOGLE,
    grant_type: 'authorization_code',
  };

  const qs = new URLSearchParams(values);

  try {
    const res = await axios.post(rootUrl, qs.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return res.data;
  } catch (err) {
    console.log('failed to fetch google auth token!');
  }
};

const login = (user, res) => {
  try {
    createSendToken(user, 200, res, true);
  } catch (err) {
    console.log(err.message);
  }
};

const signup = async (user, res) => {
  console.log(res.text);
  try {
    const newUser = await User.create({
      name: user.name,
      email: user.email,
      photo: user.picture,
    });

    console.log('new uer', newUser);

    createSendToken(newUser, 201, res, true);
  } catch (err) {
    console.log(err.message);
  }
};

exports.googleLogin = (req, res, next) => {
  const googleOauthUrl = getGoogleOauthURL();
  res.redirect(googleOauthUrl);
};

exports.googleOauthHandler = async (req, res) => {
  const code = req.query.code;

  const { id_token, access_token } = await getGoogleOauthTokens(code);

  const googleUser = jwt.decode(id_token);

  console.log(googleUser);

  const user = await User.findOne({ email: googleUser.email });
  if (user) {
    console.log(user);
    login(user, res);
  } else {
    signup(googleUser, res);
  }
};
