

const { MongoClient, ServerApiVersion } = require('mongodb');

const connectDb = async () => {
    const DB_NAME = process.env.DB_NAME || "NotePadOnline"
    const DB_URI = "mongodb+srv://admin:admin@notepadonline.aj5hvu9.mongodb.net/?retryWrites=true&w=majority&appName=NotePadOnline";

    // // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    const client = new MongoClient(DB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
    });


         // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const db = client.db(DB_NAME)
    const mongo = {
        User: db.collection("users"),
        Diary: db.collection("diaries"),
        Comment:db.collection("comments"),
        Upload:db.collection("uploads")
    }
    return {
        client, db, mongo
    }
}


module.exports = connectDb
