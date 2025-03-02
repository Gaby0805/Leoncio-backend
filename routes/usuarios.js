import express from 'express';
import connection from '../Database.js';

const router = express.Router();

// teste api
router.get('/teste', (req, res) => {
    console.log('teste usuario')
});

export default router;
