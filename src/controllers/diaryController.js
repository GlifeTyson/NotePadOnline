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
    const { mongo } = req.context || {};
    const { id } = req.params;
    const diary = mongo.Diary.find({ creator: id });
    const diaries = await diary.toArray();
    return res.json(diaries).status(200);
  },
  create: async (req, res) => {
    // const { mongo } = req.context || {};
    // const { title, content, creator } = req.body;
    // const diary = mongo.Diary.insertOne({title:title,content:content,creator:creator,viewer:"",createdAt:Date.now()});
  },
  update: async (req, res) => {},
  delete: async (req, res) => {},
};

module.exports = diaryController;
