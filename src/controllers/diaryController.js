const { date } = require("joi");
const { ObjectId } = require("mongodb");
const mongodb = require("mongodb");
const diaryController = {
  list: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const diaryCursor = mongo.Diary.find({});
      const diaries = await diaryCursor.toArray();
      res.json(diaries).status(200);
    } catch (error) {
      res
        .json({
          message: error.message,
        })
        .status(422);
    }
  },
  view: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const { id } = req.params;
      const diary = mongo.Diary.find({ creator: id });
      const diaries = await diary.toArray();
      return res.json(diaries).status(200);
    } catch (error) {
      return res.json({ message: error.message }).status(422);
    }
  },
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
        viewer: "",
        createdAt: Date.now(),
        deleteAt: "",
        updateAt: "",
      });
      return res.json({ message: "Created successfully" }).status(200);
    } catch (error) {
      return res.json({ message: error.message }).status(422);
    }
  },
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
      const diariesFound = mongo.Diary.find({ _id: parseId });
      const diary = await diariesFound.toArray();
      if (diary.length == 0) {
        return res
          .json({ message: "The diary not found to update" })
          .status(422);
      }
      //   return res.json(diary).status(200);
      await mongo.Diary.updateOne(
        { _id: parseId },
        {
          $set: { title: title, content: content, updateAt: Date.now() },
        }
      );
      return res.json({ message: "Updated successfully" }).status(200);
    } catch (error) {
      return res.json({ message: error.message }).status(422);
    }
  },
  delete: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const { id } = req.params;
      //parse id bc find query _id need ObjectID type to compare not String
      const parseId = new mongodb.ObjectId(id);
      const diariesFound = mongo.Diary.find({ _id: parseId });
      const diary = await diariesFound.toArray();
      if (diary.length == 0) {
        res
          .json({
            message: "Not found to delete",
          })
          .status(422);
      }

      await mongo.Diary.updateOne(
        { _id: parseId },
        {
          $set: { deleteAt: Date.now() },
        }
      );
      //   //   await mongo.Diary.findOneAndDelete({ _id: parseId });
      res.json({ message: "Soft Deleted successfully" }).status(200);
    } catch (error) {
      return res.json({ message: error.message }).status(422);
    }
  },
};

module.exports = diaryController;
