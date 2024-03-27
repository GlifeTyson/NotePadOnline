const Router = require("express").Router;
const commentController = require("../controllers/commentController");

const commentRoute = Router();

commentRoute.get("/api/comments", commentController.list); //get all comments
commentRoute.get("/api/diaries/:id/comments", commentController.listByDiary); //get comment by diary and user middleware (sai)
commentRoute.post("/api/comments", commentController.create); //create new comment(note)

// commentRoute.patch(
//   "/api/comments/:idDiary/reply_comment",
//   commentController.replyComment
// ); // add reply comment
commentRoute.patch("/api/comments/:id", commentController.update);
commentRoute.delete("/api/comments/:id", commentController.delete); //soft delete

module.exports = commentRoute;
