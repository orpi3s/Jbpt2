const express = require('express');
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName } = require('../db');

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /tags");

  next();
});

// Get all tags
tagsRouter.get('/', async (req, res) => {
    const tags = await getAllTags();
  
    res.send({
      tags
    });
});

// Get post by tag name
tagsRouter.get('/:tagName/posts', async (req, res, next) => {

    const {tagName} = req.params

    console.log(tagName)

    try {
        const allPosts = await getPostsByTagName(tagName);

        const posts = allPosts.filter(post => {

            if (post.active) {
                return true;
            }

            if (req.user && post.author.id === req.user.id) {
                return true;
            }

            return false;
        });

        res.send({posts});
    } catch (error) {
        next(error);
    }
});

module.exports = tagsRouter;