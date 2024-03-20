const Router = require("express").Router;
const diaryController = require("../controllers/diaryController");

const diaryRoute = Router();

diaryRoute.get("/api/diaries", diaryController.list); //get all diaries by creator
// diaryRoute.get("/api/diaries/:id", diaryController.view); //get diary by user
diaryRoute.get("/api/diaries/shared", diaryController.shared); //get shared diaries
diaryRoute.post("/api/diaries", diaryController.create); //create new diary(note)
diaryRoute.patch("/api/diaries/:id/addViewer", diaryController.addViewer); //add viewers to diary
diaryRoute.patch("/api/diaries/:id", diaryController.update);
diaryRoute.delete("/api/diaries/:id", diaryController.delete); //soft delete
diaryRoute.delete("/api/diaries/removeViewer", diaryController.removeViewer); //remove viewer from diary

module.exports = diaryRoute;
