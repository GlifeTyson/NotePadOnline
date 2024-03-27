const Joi = require("joi");
const { ObjectId } = require("mongodb");

const schema = Joi.object({
  offset: Joi.number().min(0),
  limit: Joi.number().positive(),
  // orderBy: Joi.string().pattern(/^([a-zA-Z0-9].)_(ASC|DESC)$/),
  orderBy: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]+_(ASC|DESC)")),
});

const commentController = {
  // GET /api/comments?offset=0&limit=20&orderBy=createdAt_DESC&filter={"diaryId":"66027325cfb5c042462d7d43"}
  list: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const { offset, limit, orderBy, filter } = req.query;
      const filterObj = JSON.parse(filter || "{}");

      //validate with joi
      const { error } = schema.validate({
        offset,
        limit,
        orderBy,
      });
      // console.log(error);
      if (error) {
        //
        return res.json({ message: error });
      }
      //check if diaryId user put in is ObjectID ?
      if (!ObjectId.isValid(filterObj.diaryId)) {
        //
        return console.log("filterObj.diaryId is not valid");
      }
      //find with filter
      const diaryId = new ObjectId(filterObj.diaryId);
      // const commentId = new ObjectId(filterObj.commentId);
      const commentCursor = await mongo.Comment.find({
        diaryId: diaryId,
        // comments: commentId,
        deletedAt: null,
      });
      const [field, direction] = orderBy.split("_");
      commentCursor.sort({ [field]: direction === "DESC" ? -1 : 1 });
      // { ["createdAt"]: -1 } -> { createdAt: -1 }
      console.log(typeof offset);
      commentCursor.skip(parseInt(offset));
      commentCursor.limit(Math.min(limit, 1000));
      const comments = await commentCursor.toArray();

      res.json({ message: "Get Comments success", data: { comments } });
    } catch (error) {
      res
        .json({
          message: error.message,
        })
        .status(422);
    }
  },
  view: async (req, res) => {},
  // GET /api/diaries/:id/comments (id Diary)
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
  /*
    diaryId: string | required
    content: string | required
    commentId: string | optional
  */
  create: async (req, res) => {
    try {
      const { mongo, user } = req.context || {};
      const { content, diaryId, commentId } = req.body;
      // const { id } = req.params;
      const parseDiaryID = new ObjectId(diaryId);
      if (content.length == 0 || diaryId.length == 0) {
        return res
          .json({ message: "Diary id or content cant be null" })
          .status(422);
      }
      //check diary exist thuoc trong list mynote / shared note

      const diary = await mongo.Diary.findOne({
        _id: parseDiaryID,
      });
      if (!diary) {
        return res.json({ message: "Not found diary" }).status(422);
      }
      //check if having comment or not if not then send null to commentObject.commentId to know that the first comment
      const comment = diaryId
        ? await mongo.Comment.findOne({ _id: new ObjectId(commentId) })
        : null;

      const commentOb = {
        _id: new ObjectId(),
        content: content,
        creator: user._id,
        diaryId: diary._id,
        commentId: comment ? comment._id : null,
        createdAt: Date.now(),
        deletedAt: null,
        updatedAt: null,
      };

      await mongo.Comment.insertOne(commentOb);
      const commentFound = await mongo.Comment.findOne({ _id: commentOb._id });
      return res
        .json({ message: "Created successfully", data: commentFound })
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
