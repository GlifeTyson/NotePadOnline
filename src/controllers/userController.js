const connectDb = require("../database");
const userValidator = require("../validator/userValidator");
const hashPassword = require("../utils/index");
const bcrypt = require('bcrypt');
const userController = {
  list: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const usersCursor = mongo.User.find({});

      usersCursor.sort({ createdAt: -1 });
      usersCursor.skip(0);
      usersCursor.limit(10);
      const users = await usersCursor.toArray();
      res.json(users).status(200);
    } catch (error) {
      console.log(error);
      res
        .json({
          message: error.message,
        })
        .status(422);
    }
    // res.json([]).status(200);
  },
  view: async (req, res) => {
    try {
      const { client, db } = await connectDb();
      const collectionUser = db.collection("user");
      const { id } = req.params;
      const currentUser = await collectionUser.findOne({ _id: id });
      res.json(currentUser);
    } catch (error) {
      console.log(error);
    }
    // res.json([]).status(200);
  },
  create: async (req, res) => {
    const { mongo } = req.context || {};
    const { name, email, password } = req.body;
    const { error, value } = userValidator.validate(req.body);
    // console.log(value);
    if (error) {
      return res.json({message:"Fail at validation"}).status(400);
    }
    let nameCheck = await mongo.User.findOne({
      name: req.body.name,
    });
    if(nameCheck){
      return res.json({message:"Username have been registed"}).status(400);
    }
    let emailCheck = await mongo.User.findOne({
      email:req.body.email
    })
    if(emailCheck){
      return res.json({message:"Email have been registed"}).status(400);
    }
    if (value) {
      // res.send("Good at validation").status(200);
      let newUser = await mongo.User.insertOne({
        name: name,
        email: email,
        password: hashPassword(password),
        createdAt: Date.now(),
      });
      res.json({message:"Create New User Successfully"}).status(200);
    }
  },
  update: async (req, res) => {
    res.json([]).status(200);
  },
  delete: async (req, res) => {
    res.json([]).status(200);
  },

  signIn: async (req, res) => {
    const { mongo } = req.context || {};
    
    let userLogin = await mongo.User.findOne({
      name: req.body.name,
    });
    if (!userLogin) {
      return res.json("Wrong username").status(422);
    }
    const validPass = bcrypt.compareSync(req.body.password,userLogin.password);
    if(!validPass){
      return res.json({message:'Wrong password'}).status(400);
    }
    if(userLogin){
        // const userInfo= userLogin.toArray();
      return res.json({message:'Login success'}).status(200);
    }
  },
};

module.exports = userController;
