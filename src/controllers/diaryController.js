const { ObjectId } = require("mongodb");
const diaryController = {
  // GET /api/diaries get diary by user login
  list: async (req, res) => {
    try {
      const { mongo, user } = req.context || {};
      // return console.log(id);
      const diaryCursor = mongo.Diary.find({
        deletedAt: null,
        creator: user._id,
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
      const { mongo, user } = req.context || {};
      const shareDiary = mongo.Diary.find({
        deletedAt: null,
        "viewers.id": user._id,
        // _id: { $in: user.sharedDiaryIds || [] },
      });
      const sharedDiary = await shareDiary.toArray();
      if (!shareDiary) {
        return res.json({ message: "Not found" }).status(422);
      }
      return res.json(sharedDiary).status(200);
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
      const parseId = new ObjectId(id);
      const diary = await mongo.Diary.findOne({ _id: parseId });
      // const parseDiary = await diary.toArray();
      return res.json(diary).status(200);
    } catch (error) {
      return res.json({ message: error.message }).status(422);
    }
  },
  // POST /api/diaries
  create: async (req, res) => {
    try {
      const { mongo, user } = req.context || {};
      const { title, content } = req.body;
      if (title.length == 0 || content.length == 0) {
        return res
          .json({ message: "Please fill in title and content" })
          .status(422);
      }
      const diary = {
        _id: new ObjectId(),
        title: title,
        content: content,
        creator: user._id,
        viewers: [],
        createdAt: Date.now(),
        deletedAt: null,
        updatedAt: null,
      };
      await mongo.Diary.insertOne(diary);
      return res
        .json({ message: "Created successfully", data: diary })
        .status(200);
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
      const parseId = new ObjectId(id);
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
      const parseId = new ObjectId(id);
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
  // POST /api/viewers
  // Body: {diary_id:, user_id:}

  // PATCH /api/diaries/:id/addViewer
  //patch /api/diaries/addViewer
  addViewer: async (req, res) => {
    try {
      const { mongo, user } = req.context || {};
      const { userId } = req.body;
      const { id } = req.params;
      let diary = await mongo.Diary.findOne({
        _id: new ObjectId(id),
        deletedAt: null,
        creator: user._id,
      });
      const viewer = await mongo.User.findOne({
        _id: new ObjectId(userId),
        deletedAt: null,
      });
      if (!viewer) {
        return res
          .json({ message: "Not found user to add to diary" })
          .status(422);
      }

      const existed = diary.viewers.find(
        (v) => String(v.id) === String(viewer._id)
      );
      if (!existed) {
        await mongo.Diary.updateOne(
          { _id: diary._id },
          {
            $push: { viewers: { id: viewer._id, sharedAt: Date.now() } },
          }
        );
        if (viewer.sharedDiaryIds) {
          const existedDiaryId = viewer.sharedDiaryIds.find(
            (e) => String(e) === String(diary._id)
          );
          if (!existedDiaryId) {
            await mongo.User.updateOne(
              { _id: viewer._id },
              {
                $push: { sharedDiaryIds: diary._id },
              }
            );
          }
        } else {
          await mongo.User.updateOne(
            { _id: viewer._id },
            {
              $set: {
                sharedDiaryIds: [diary._id],
              },
            }
          );
        }
      }
      diary = await mongo.Diary.findOne({
        _id: diary._id,
      });
      res.json({ message: "Add viewer success", data: diary }).status(200);
    } catch (error) {
      return res.json({ message: error.message }).status(422);
    }
  },
  //Delete /api/diaries/removeViewer
  removeViewer: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const { viewer, idDiary } = req.body;
      const parseId = new ObjectId(idDiary);
      const parseViewer = new ObjectId(viewer);
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
          $pull: { viewers: { _id: [viewer] } },
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
