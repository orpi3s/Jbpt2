const express = require('express');
const jwt = require('jsonwebtoken');
const usersRouter = express.Router();
const { getAllUsers, getUserByUsername, createUser, getUserById, updateUser} = require('../db');
const { requireUser } = require('./utils');

usersRouter.use((req, res, next) => {
  next();
});

// Get all users
usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers();
  
    res.send({
      users
    });
});

// Register user
usersRouter.post('/register', async (req, res, next) => {
    const { username, password, name, location } = req.body;
  
    try {
        const _user = await getUserByUsername(username);
    
        if (_user) {
            next({
            name: 'UserExistsError',
            message: 'A user by that username already exists'
            });
        }
    
        const user = await createUser({
            username,
            password,
            name,
            location,
        });
    
        const token = jwt.sign({ 
            id: user.id, 
            username
        }, process.env.JWT_SECRET, {
            expiresIn: '1w'
        });

        console.log(token)
    
        res.send({ 
            message: "thank you for signing up",
            token 
        });
    } catch ({ name, message }) {
        next({ name, message })
    } 
});

// Login user
usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      next({
        name: "MissingCredentialsError",
        message: "Please supply both a username and password"
      });
    }
  
    try {
        const user = await getUserByUsername(username);
    
        if (user && user.password == password) {

            const jwt = require('jsonwebtoken');
            const token = jwt.sign({username: user.username, id: user.id}, process.env.JWT_SECRET)

            res.send({ message: "you're logged in!", token });
        } else {
            next({ 
            name: 'IncorrectCredentialsError', 
            message: 'Username or password is incorrect'
            });
        }
    } catch({ name, message }) {
        next({ name, message });
    }
});

// activate user
usersRouter.patch('/:userId', requireUser, async (req, res, next) => {

    try {

        const user = await getUserById(req.params.userId);
    
        if (user && user.id === req.user.id) {

            const updatedUser = await updateUser(user.id, { active: true });

            res.send({ user: updatedUser });
        } else {
            next({ 
                name: "UnauthorizedUserError",
                message: "You cannot update a user which is not yours"
            });
        }
  
    } catch ({ name, message }) {
        next({ name, message })
    }
});

// deactivate user
usersRouter.delete('/:userId', requireUser, async (req, res, next) => {

    try {

        const user = await getUserById(req.params.userId);
    
        if (user && user.id === req.user.id) {

            const updatedUser = await updateUser(user.id, { active: false });
    
            res.send({ updatedUser });
        } else {
            next({ 
                name: "UnauthorizedUserError",
                message: "You cannot delete a user which is not yours"
            });
        }
  
    } catch ({ name, message }) {
        next({ name, message })
    }
});

module.exports = usersRouter;