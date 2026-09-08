const express = require('express')
const router = express.Router();
const knex = require('knex')(require('../knexfile.js')['development']);

router.use(express.json());

// returns users table
router.get('/', (request, response) => {
    knex('users')
        .select('*')
        .then(users => response.json(users))
});

// gets a user by id
router.get('/:id', (request, response) => {
    const { id } = request.params;

    knex('users')
        .where('id', id)
        .first()
        .then(user => response.json(user))
});

// adds a user
router.post('/users', (request, response) => {
    const { username, pw_hash, is_admin, is_evaluator, is_planner } = request.body

    if(!username || !pw_hash) {
        return response.status(400).json({ error: "Username and password required."})
    };

    knex('users')
        .insert({
            
        })
});

// delete a user
router.delete();

// edit a user
// edit a field of a user
router.patch();
