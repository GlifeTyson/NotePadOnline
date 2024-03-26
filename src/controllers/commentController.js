const { ObjectId } = require("mongodb");

const commentController = {
  list: async (req, res) => {},
  view: async (req, res) => {},
  //GET /api/comments/:id (id Diary)
  listByDiary: async (req, res) => {
    try {
      const { mongo, user } = req.context || {};
      const { id } = req.params;
      const parseId = new ObjectId(id);

      console.log("id Diary:", parseId);
      console.log("id User:", user._id);

      const foundComment = await mongo.Comment.find({
        diaryId: parseId,
        // creator: user._id,
        deletedAt: null,
      });

      if (!foundComment) {
        return req.json({ message: "This diary not have comment" }).status(422);
      }
      foundComment.sort({ createdAt: -1 });
      foundComment.skip(0);
      foundComment.limit(10);
      const comments = await foundComment.toArray();
      return res.json(comments).status(200);
    } catch (error) {
      res
        .json({
          message: error.message,
        })
        .status(422);
    }
  },

  //POST /api/comments
  create: async (req, res) => {
    try {
      const { mongo, user } = req.context || {};
      const { content } = req.body;
      const { id } = req.params;
      if (content.length == 0) {
        return res.json({ message: "Please fill in content" }).status(422);
      }
      const commentOb = {
        _id: new ObjectId(),
        content: content,
        creator: user._id,
        diaryId: new ObjectId(id),
        reply_comments: [],
        createdAt: Date.now(),
        deletedAt: null,
        updatedAt: null,
      };
      await mongo.Comment.insertOne(commentOb);
      const commentFound = await mongo.Comment.findOne({ _id: commentOb._id });
      const diary = await mongo.Diary.updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $push: {
            comments: commentFound,
          },
          // $pop: { comments: 1 },
        }
      );
      const diaryFound = await mongo.Diary.findOne({
        _id: new ObjectId(id),
      });

      return res
        .json({ message: "Created successfully", data: diaryFound })
        .status(200);
    } catch (error) {
      res
        .json({
          message: error.message,
        })
        .status(422);
    }
  },

  //PATCH /api/comments/:id/reply_comment (id: idDiary)
  replyComment: async (req, res) => {
    try {
      const { mongo, user } = req.context || {};
      // console.log(user._id);
      const { idDiary } = req.params;
      console.log("idDiary:", idDiary);
      const { content, idComment } = req.body;
      const parseIdDiary = new ObjectId(idDiary);
      const parseIdComment = new ObjectId(idComment);

      const reply_commentOb = {
        _id: new ObjectId(),
        idUserReply: user._id,
        content: content,
        repliedAt: Date.now(),
      };
      // update by push in field reply_comments in comment collection
      const reply_comment = await mongo.Comment.updateOne(
        {
          _id: parseIdComment,
        },
        {
          $push: { reply_comments: reply_commentOb },
          // $pop: { reply_comments: -1 },
        }
      );
      //update by push in diary field comments.reply_comments
      const updateDiary = await mongo.Diary.updateOne(
        { _id: parseIdDiary },
        {
          $push: {
            "comments.$[].reply_comments": reply_commentOb,
          },
          // $pop: { comments: -1 },
        }
      );

      // const find_comment = await mongo.Diary.findOne({
      //   _id: new ObjectId(id),
      // });
      const foundComment = await mongo.Comment.findOne({ _id: parseIdComment });

      return res
        .json({ message: "Reply success", data: foundComment })
        .status(200);
    } catch (error) {
      res
        .json({
          message: error.message,
        })
        .status(422);
    }
  },
  update: async (req, res) => {},
  delete: async (req, res) => {},
};

module.exports = commentController;
