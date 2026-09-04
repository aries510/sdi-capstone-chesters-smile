const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const knex = require('knex')(require('../knexfile.js')['development']);
const router = express.Router();

const saltRounds = 10;

app.use(express.json());

router.get('/', (req, res) => {
  const { username } = req.query;
  const query = knex('users').select('*');

  if (username) {
    query.where('username', 'ilike', username);
  }
  query
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.get('/:userId', (req, res) => {
  const { userId } = req.params;

  if (!/^\d+$/.test(userId)) {
    return res.status(400).json({ error: 'userId must be a positive integer' });
  }

  knex('users')
    .select('*')
    .where('id', userId)
    .first()
    .then((users) => {
      if (!users) {
        return res.status(404).json({ error: 'user not found' });
      }
      res.status(200).json(users);
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.post('/', (req, res) => {
  const { username, pw_hash, is_admin, is_evaluator, is_planner } = req.body;
  if (!username || !pw_hash) {
    return res
      .status(400)
      .json({ error: 'username and password are required' });
  }

  knex('users')
    .select('id')
    .where('username', 'ilike', username)
    .first()
    .then((existing) => {
      if (existing) {
        return res.status(409).json({ error: 'user already exists' });
      }

      return bcrypt.hash(pw_hash, saltRounds).then((hashedPassword) =>
        knex('users')
          .insert({
            username,
            pw_hash: hashedPassword,
            is_admin: !!is_admin,
            is_evaluator: !!is_evaluator,
            is_planner: !!is_planner,
          })
          .returning([
            'id',
            'username',
            'is_admin',
            'is_evaluator',
            'is_planner',
          ])
          .then(([user]) => res.status(201).json(user)),
      );
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.delete('/:userId', (req, res) => {
  const { userId } = req.params;

  if (!/^\d+$/.test(userId)) {
    return res.status(400).json({ error: 'userId must be a positive integer' });
  }

  knex('users')
    .where('id', userId)
    .del()
    .then((deletedCount) => {
      if (!deletedCount) {
        return res.status(404).json({ error: 'user not found' });
      }
      res.status(204).end();
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.patch('/:userId', (req, res) => {
  const { userId } = req.params;
  const { pw_hash, is_admin, is_evaluator, is_planner } = req.body;

  if (!/^\d+$/.test(userId)) {
    return res.status(400).json({ error: 'userId must be a positive integer' });
  }

  if (
    pw_hash === undefined &&
    is_admin === undefined &&
    is_evaluator === undefined &&
    is_planner === undefined
  ) {
    return res.status(400).json({ error: 'no fields to update' });
  }

  knex('users')
    .select('id')
    .where('id', userId)
    .first()
    .then((existing) => {
      if (!existing) {
        return res.status(404).json({ error: 'user not found' });
      }

      const updates = {};
      if (is_admin !== undefined) updates.is_admin = !!is_admin;
      if (is_evaluator !== undefined) updates.is_evaluator = !!is_evaluator;
      if (is_planner !== undefined) updates.is_planner = !!is_planner;

      const applyUpdate = pw_hash
        ? bcrypt
            .hash(pw_hash, saltRounds)
            .then((hashedPassword) => ({ ...updates, pw_hash: hashedPassword }))
        : Promise.resolve(updates);

      return applyUpdate.then((finalUpdates) =>
        knex('users')
          .where('id', userId)
          .update(finalUpdates)
          .returning([
            'id',
            'username',
            'is_admin',
            'is_evaluator',
            'is_planner',
          ])
          .then(([user]) => res.status(200).json(user)),
      );
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

module.exports = router;
