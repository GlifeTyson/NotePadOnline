const express = require("express");
const connectDb = require("./database");
const userRoute = require("./routes/userRoute");
var bodyParser = require("body-parser");

async function run() {
  try {
    const { client, db, mongo } = await connectDb();
    // await db.collection("users").insertOne({name: "tyson.quach1", createdAt: Date.now()})
    const app = express();

    app.use((req, res, next) => {
      req.context = {
        db,
        mongo,
      };
      next();
    });

    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(userRoute);

    app.listen(3000, () => {
      console.log("Express Server running on http://localhost:3000");
    });
  } catch (error) {
    // Ensures that the client will close when you finish/error
    console.log(error);
  }
}
run().catch(console.dir);
