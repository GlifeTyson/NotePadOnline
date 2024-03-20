const commentController = {
  list: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const commentCursor = mongo.Comment.find({ deleteAt: null });
      commentCursor.sort({ createdAt: -1 });
      commentCursor.skip(0);
      commentCursor.limit(10);
      const diaries = await commentCursor.toArray();
      res.json(diaries).status(200);
    } catch (error) {
      res
        .json({
          message: error.message,
        })
        .status(422);
    }
  },
  view: async (req, res) => {},
  create: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const { content, creator, diary } = req.body;
      if (content.length == 0) {
        return res.json({ message: "Please fill in content" }).status(422);
      }
      const comment = await mongo.Comment.insertOne({
        content: content,
        creator: creator,
        diary: diary,
        reply_comment: [],
        createdAt: Date.now(),
        deletedAt: null,
        updatedAt: null,
      });
      return res.json({ message: "Created successfully" }).status(200);
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
