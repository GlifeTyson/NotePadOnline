const { date } = require("joi");
const { ObjectId } = require("mongodb");
const mongodb = require("mongodb");
const diaryController = {
  // GET /api/diaries
  list: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const diaryCursor = mongo.Diary.find({ deleteAt: null });
      diaryCursor.sort({ createdAt: -1 });
      diaryCursor.skip(0);
      diaryCursor.limit(10);
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
  // GET /api/diaries/:id
  view: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const { id } = req.params;
      const parseId = new mongodb.ObjectId(id);
      const diary = mongo.Diary.findOne({ _id: parseId });
      return res.json(diary).status(200);
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
        deleteAt: null,
        updateAt: null,
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
          $set: { title: title, content: content, updateAt: Date.now() },
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
          $set: { deleteAt: Date.now() },
        }
      );
      //   //   await mongo.Diary.findOneAndDelete({ _id: parseId });
      return res.json({ message: "Soft Deleted successfully" }).status(200);
    } catch (error) {
      return res.json({ message: error.message }).status(422);
    }
  },
  //patch /api/diaries
  addViewer: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const { viewer, id } = req.body;
      const parseId = new mongodb.ObjectId(id);
      const diaryFound = await mongo.Diary.findOne({ _id: parseId });
      if (!diaryFound) {
        return res
          .json({ message: "Not found diary to add viewer" })
          .status(422);
      } else {
        try {
          const diaryToAdd = await mongo.Diary.updateOne({
            viewer: viewer,
          });
          return res.json({ message: "Add viewer success" }).status(200);
        } catch (error) {
          return res.json({ message: message.error }).status(422);
        }
      }
    } catch (error) {
      return res.json({ message: message.error }).status(422);
    }
  },
};

module.exports = diaryController;
