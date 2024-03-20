// const { ObjectId } = require("mongodb");
const mongodb = require("mongodb");
const diaryController = {
  // GET /api/diaries get diary by user login
  list: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const { idUser } = req.params;
      // return console.log(id);
      const diaryCursor = mongo.Diary.find({
        deletedAt: null,
        creator: idUser,
      });
      diaryCursor.sort({ createdAt: -1 });
      diaryCursor.skip(0);
      diaryCursor.limit(10);
      const diaries = await diaryCursor.toArray();
      return res.json(diaries).status(200);
    } catch (error) {
      res
        .json({
          message: error.message,
        })
        .status(422);
    }
  },

  //GET /api/dairies/shared
  shared: async (req, res) => {
    try {
    } catch (error) {
      res
        .json({
          message: error.message,
        })
        .status(422);
    }
  },
  // GET /api/diaries/:id
  view: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const { id } = req.params;
      const parseId = new mongodb.ObjectId(id);
      const diary = mongo.Diary.find({ _id: parseId });
      const parseDiary = await diary.toArray();
      return res.json(parseDiary).status(200);
    } catch (error) {
      return res.json({ message: error.message }).status(422);
    }
  },
  // POST /api/diaries
  create: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const { title, content, creator } = req.body;
      if (title.length == 0 || content.length == 0) {
        return res
          .json({ message: "Please fill in title and content" })
          .status(422);
      }
      const diary = mongo.Diary.insertOne({
        title: title,
        content: content,
        creator: creator,
        viewers: [],
        createdAt: Date.now(),
        deletedAt: null,
        updatedAt: null,
        comments: null,
      });
      return res.json({ message: "Created successfully" }).status(200);
    } catch (error) {
      return res.json({ message: error.message }).status(422);
    }
  },
  // PATCH /api/diaries/:id
  update: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const { title, content } = req.body;
      const { id } = req.params;
      if (title.length == 0 || content.length == 0) {
        return res
          .json({ message: "Please fill in title and content" })
          .status(422);
      }
      //parse id bc find query _id need ObjectID type to compare not String
      const parseId = new mongodb.ObjectId(id);
      const diariesFound = mongo.Diary.findOne({
        _id: parseId,
        deletedAt: null,
      });
      // const diary = await diariesFound.toArray();
      if (!diariesFound) {
        return res
          .json({ message: "The diary not found to update" })
          .status(422);
      }
      //   return res.json(diary).status(200);
      await mongo.Diary.updateOne(
        { _id: parseId },
        {
          $set: { title: title, content: content, updatedAt: Date.now() },
        }
      );
      return res.json({ message: "Updated successfully" }).status(200);
    } catch (error) {
      return res.json({ message: error.message }).status(422);
    }
  },
  // DELETE /api/diaries/:id
  delete: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const { id } = req.params;
      //parse id bc find query _id need ObjectID type to compare not String
      const parseId = new mongodb.ObjectId(id);
      const diariesFound = mongo.Diary.findOne({
        _id: parseId,
      });
      if (!diariesFound) {
        return res
          .json({
            message: "Not found to delete or deleted",
          })
          .status(422);
      }

      await mongo.Diary.updateOne(
        { _id: parseId },
        {
          $set: { deletedAt: Date.now() },
        }
      );
      //   //   await mongo.Diary.findOneAndDelete({ _id: parseId });
      return res.json({ message: "Soft Deleted successfully" }).status(200);
    } catch (error) {
      return res.json({ message: error.message }).status(422);
    }
  },
  //patch /api/diaries/addViewer
  addViewer: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const { viewer, idDiary } = req.body;
      const parseId = new mongodb.ObjectId(idDiary);
      const parseViewer = new mongodb.ObjectId(viewer);
      const userFound = await mongo.User.findOne({ _id: parseViewer });
      if (!userFound) {
        return res
          .json({ message: "Not found user to add to diary" })
          .status(422);
      }
      const diaryFound = await mongo.Diary.findOneAndUpdate(
        { _id: parseId },
        {
          $push: { viewers: { _id: [viewer] } },
          // $pop: { viewers: 1 },
        }
      );
      if (!diaryFound) {
        return res
          .json({ message: "Not found diary to add viewer" })
          .status(422);
      }

      res.json({ message: "Add viewer success" }).status(200);
    } catch (error) {
      return res.json({ message: error.message }).status(422);
    }
  },
  //Delete /api/diaries/removeViewer
  removeViewer: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const { viewer, idDiary } = req.body;
      const parseId = new mongodb.ObjectId(idDiary);
      const parseViewer = new mongodb.ObjectId(viewer);
      const userFound = await mongo.User.findOne({ _id: parseViewer });
      if (!userFound) {
        return res
          .json({ message: "Not found user to delete from diary" })
          .status(422);
      }
      const diaryFound = await mongo.Diary.findOneAndUpdate(
        { _id: parseId },
        {
          //remove by using $pull viewer from viewers array
          $pull: { viewers: viewer },
        }
      );
      if (!diaryFound) {
        return res
          .json({ message: "Not found diary to delete viewer" })
          .status(422);
      }
      res.json({ message: "Add viewer success", data: diaryFound }).status(200);
    } catch (error) {
      return res.json({ message: error.message }).status(422);
    }
  },
};

module.exports = diaryController;
