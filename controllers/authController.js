const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

let refreshTokens = [];
const authController = {

  registerUser: async (req, res) => {
    try {
      
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);

      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashed,
      });

      try {
        const user = await newUser.save();
        res.status(200).json(user);
      } catch (error) {
        console.log("🚀 ~ file: authController.js:24 ~ registerUser: ~ error:", error)
      }

    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  generateAccessToken: (user) => {
    return jwt.sign({
      id: user.id,
      manager: user.manager
    },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: "30s" }
    );
  },

  generateRefreshToken: (user) => {
    return jwt.sign({
      id: user.id,
      isManager: user.isManager,
    },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "365d" }
    );
  },

  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        res.status(404).json("Wrong username")
      }
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        res.status(404).json("Wrong password");
      }
      if (user && validPassword) {
        const accessToken = authController.generateAccessToken(user);
        const refreshToken = authController.generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        res.cookie("refreshToken", refreshToken,{
          httpOnly : true,
          secure: false,
          path:"/",
          sameSite:"strict",
        })

        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, accessToken, refreshToken})
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },

  requestRefreshToken: async(req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken)
      return res.status(401).json("You're not authenticated");
    if(!refreshTokens.includes(refreshToken)){
      return res.status(403).json("Token is not valid");
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err,user) => {
      if(err){
        console.log(err);
      }
      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
      
      const newAccessToken = authController.generateAccessToken(user);
      const newRefreshToken = authController.generateRefreshToken(user);
      refreshTokens.push(newRefreshToken);
      res.cookie("refreshToken", refreshToken,{ 
        httpOnly: true,
        secure: false,
        path: '/',
        sameSite: 'strict'
      })
      res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    });

},

  logOut: async (req,res) => {
    refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
    res.clearCookie("refreshToken");
    res.status(200).json("Logged out");
  },
};

module.exports = authController;