const Router = require('express').Router
const userController = require('../controllers/userController')


const userRoute = Router()

userRoute.get("/api/users", userController.list);
userRoute.get("/api/users/:id", userController.view);
userRoute.post("/api/users", userController.create); // sign up
userRoute.post("/api/users/sign-in", userController.signIn); // sign in
userRoute.patch("/api/users/:id", userController.update);
userRoute.delete("/api/users/:id", userController.delete);


module.exports = userRoute