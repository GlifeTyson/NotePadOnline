const Router = require("express").Router;
const diaryController = require("../controllers/diaryController");

const diaryRoute = Router();

diaryRoute.get("/api/diaries", diaryController.list); //get all diaries
diaryRoute.get("/api/diaries/:id", diaryController.view); //get diary by user
diaryRoute.post("/api/diaries", diaryController.create); //create new diary(note)
diaryRoute.patch("/api/diaries/:id", diaryController.update);
diaryRoute.delete("/api/diaries/:id", diaryController.delete); //soft delete

module.exports = diaryRoute;
