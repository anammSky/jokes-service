const express = require("express");
const sequelize = require("sequelize");
const { Op, where } = require("sequelize");
const app = express();
const { Joke } = require("./db");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/jokes", async (req, res, next) => {
  try {
    const { tags, content } = req.query;
    const where = {};
    if (tags && !Array.isArray(tags)) {
      where.tags = {
        [Op.and]: tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .map((tag) => ({ [Op.like]: `%${tag}%` })),
      };
    }

    if (tags && Array.isArray(tags)) {
      where.tags = {
        [Op.or]: tags
          .map((tag) => tag.trim().toLowerCase())
          .map((tag) => ({ [Op.like]: `%${tag}%` })),
      };
    }

    if (content) {
      where.joke = sequelize.where(
        sequelize.fn("LOWER", sequelize.col("joke")),
        Op.like,
        `%${content}%`
      );
    }

    const jokes = await Joke.findAll({
      where: where,
      attributes: {
        exclude: ["updatedAt", "createdAt"],
      },
    });
    res.send(jokes);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// we export the app, not listening in here, so that we can run tests
module.exports = app;
