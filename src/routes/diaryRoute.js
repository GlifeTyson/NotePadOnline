const Router = require("express").Router;
const diaryController = require("../controllers/diaryController");

const diaryRoute = Router();

diaryRoute.get("/api/diaries", diaryController.list); //get all diaries
diaryRoute.get("/api/diaries/:id", diaryController.view); //get diary by user
diaryRoute.post("/api/diaries", diaryController.create); //create new diary(note)
diaryRoute.patch("/api/diaries/addViewer", diaryController.addViewer); //add viewers to diary
diaryRoute.patch("/api/diaries/:id", diaryController.update);
diaryRoute.delete("/api/diaries/:id", diaryController.delete); //soft delete
diaryRoute.delete("/api/diaries/removeViewer", diaryController.removeViewer); //remove viewer from diary

module.exports = diaryRoute;
