const express = require('express')
const router = express.Router();

// returns users table
router.get('/', (request, response) => {
    knex('users')
        .select('*')
        .then(users => response.json(users))
});

// gets a user by id
// adds a user
// edit a user
// edit a field of a user
