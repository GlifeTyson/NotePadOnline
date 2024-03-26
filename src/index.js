const express = require("express");
const connectDb = require("./database");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const userRoute = require("./routes/userRoute");
const diaryRoute = require("./routes/diaryRoute");
const commentRoute = require("./routes/commentRoute");
var bodyParser = require("body-parser");
const { SECRET_KEY } = require("./config");

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
async function run() {
  try {
    const { client, db, mongo } = await connectDb();
    const app = express();

    const addUser = async (req, res, next) => {
      // console.log("run addUser");
      const token = req.headers["x-token"];
      if (token) {
        try {
          const { id } = jwt.verify(token, SECRET_KEY);
          req.userId = id;
        } catch (err) {
          // const refreshToken = req.headers['x-refresh-token']
          // const newTokens = await refreshTokens(token, refreshToken, mongo, SECRET1, SECRET2)
          // if (newTokens.token && newTokens.refreshToken) {
          //   res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token')
          //   res.set('x-token', newTokens.token)
          //   res.set('x-refresh-token', newTokens.refreshToken)
          // }
          // req.user = newTokens.user
        }
      }

      next();
    };

    app.use(addUser);

    app.use(async (req, res, next) => {
      console.log("run Context");
      const userId = req.userId;
      console.log("userId", userId);
      const user = userId
        ? await mongo.User.findOne({
            _id: new ObjectId(userId),
            deletedAt: null,
          })
        : null;
      req.context = {
        db,
        mongo,
        user,
      };
      next();
    });
    const requiredLogin = (req, res, next) => {
      console.log("run requiredLogin");
      const { user } = req.context || {};
      if (!user) {
        return res
          .json({
            message: "Unauthorized",
          })
          .status(401);
      }
      next();
    };

    app.use(cors(corsOptions));
    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(userRoute);
    //middleware require user need to login
    app.use(requiredLogin, diaryRoute);
    app.use(requiredLogin, commentRoute);

    app.listen(3000, () => {
      console.log("Express Server running on http://localhost:3000");
    });
  } catch (error) {
    // Ensures that the client will close when you finish/error
    console.log(error);
  }
}
run().catch(console.dir);
