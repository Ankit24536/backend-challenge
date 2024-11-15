const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// Create Collection
router.post('/collections', async (req, res) => {
    const { userId, name, description } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO collections (user_id, name, description) VALUES ($1, $2, $3) RETURNING *',
            [userId, name, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Recommendation to Collection
router.post('/collections/:id/recommendations', async (req, res) => {
    const { id } = req.params;
    const { recommendationId } = req.body;

    try {
        const recommendation = await pool.query(
            'SELECT * FROM recommendations WHERE id = $1',
            [recommendationId]
        );

        if (!recommendation.rows.length) {
            return res.status(404).json({ error: 'Recommendation not found' });
        }

        await pool.query(
            'INSERT INTO collection_recommendations (collection_id, recommendation_id) VALUES ($1, $2)',
            [id, recommendationId]
        );

        res.status(201).json({ message: 'Recommendation added to collection' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Remove Recommendation from Collection
router.delete('/collections/:id/recommendations/:recommendationId', async (req, res) => {
    const { id, recommendationId } = req.params;

    try {
        await pool.query(
            'DELETE FROM collection_recommendations WHERE collection_id = $1 AND recommendation_id = $2',
            [id, recommendationId]
        );

        res.status(200).json({ message: 'Recommendation removed from collection' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// View Recommendations of a Collection
router.get('/collections/:id/recommendations', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT r.* 
             FROM recommendations r
             JOIN collection_recommendations cr ON r.id = cr.recommendation_id
             WHERE cr.collection_id = $1`,
            [id]
        );

        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Collection
router.delete('/collections/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM collections WHERE id = $1', [id]);
        res.status(200).json({ message: 'Collection deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
