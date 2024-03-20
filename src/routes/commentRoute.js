const Router = require("express").Router;
const commentController = require("../controllers/commentController");

const commentRoute = Router();

commentRoute.get("/api/comments", commentController.list); //get all comments
commentRoute.get("/api/comments/:id", commentController.view); //get comment by user
commentRoute.post("/api/comments", commentController.create); //create new comment(note)
commentRoute.patch("/api/comments/:id", commentController.update);
commentRoute.delete("/api/comments/:id", commentController.delete); //soft delete

module.exports = commentRoute;
