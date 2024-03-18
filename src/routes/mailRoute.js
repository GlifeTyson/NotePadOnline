const Router = require("express").Router;
const mailController = require("../controllers/mailController");

const mailRoute = Router();

mailRoute.post("/sendMail", mailController.send);
module.exports = userRoute;
