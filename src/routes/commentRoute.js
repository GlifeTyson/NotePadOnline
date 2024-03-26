const Router = require("express").Router;
const commentController = require("../controllers/commentController");

const commentRoute = Router();

commentRoute.get("/api/comments", commentController.list); //get all comments
commentRoute.get("/api/comments/:id", commentController.listByDiary); //get comment by diary and user middleware
commentRoute.patch(
  "/api/comments/:idDiary/reply_comment",
  commentController.replyComment
); // add reply comment
commentRoute.post("/api/comments/:id", commentController.create); //create new comment(note)
commentRoute.patch("/api/comments/:id", commentController.update);
commentRoute.delete("/api/comments/:id", commentController.delete); //soft delete

module.exports = commentRoute;
