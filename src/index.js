const express = require("express");
const connectDb = require("./database");
const cors = require("cors");

const userRoute = require("./routes/userRoute");
const diaryRoute = require("./routes/diaryRoute");
const commentRoute = require("./routes/commentRoute");
var bodyParser = require("body-parser");
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
async function run() {
  try {
    const { client, db, mongo } = await connectDb();
    // await db.collection("diaries").insertOne({title:"Diary 2",content:"Tomorrow is friday 15/3/2024",viewers:"",creator:"65f2b8dfe5d1bce37a25a17f",createdAt:Date.now()});
    // await db.collection("users").insertOne({name: "tyson.quach1", createdAt: Date.now()})
    const app = express();

    app.use((req, res, next) => {
      req.context = {
        db,
        mongo,
      };
      next();
    });

    app.use(cors(corsOptions));
    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(userRoute);
    app.use(diaryRoute);
    app.use(commentRoute);

    app.listen(3000, () => {
      console.log("Express Server running on http://localhost:3000");
    });
  } catch (error) {
    // Ensures that the client will close when you finish/error
    console.log(error);
  }
}
run().catch(console.dir);
