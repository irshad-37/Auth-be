const express = require('express');
const router = express.Router();
const CustomerRequest = require('../models/CustomerRequest');
const { ensureAuthenticated } = require('../middleware/auth');
const axios = require('axios');

// Submit a customer service request
router.post('/submit', ensureAuthenticated, async (req, res) => {
    const { category, comments } = req.body;
    const userId = req.user.id;

    try {
        const customerRequest = new CustomerRequest({ userId, category, comments });
        await customerRequest.save();

        // Send request to Intercom
        await axios.post('https://api.intercom.io/messages', {
            message_type: 'inapp',
            body: comments,
            from: { type: 'user', id: userId },
            to: { type: 'admin', id: '123456' } // Replace with actual admin ID
        }, {
            headers: { Authorization: `Bearer ${process.env.INTERCOM_ACCESS_TOKEN}` }
        });

        res.status(201).json(customerRequest);
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit request' });
    }
});

// Retrieve customer service requests by category
router.get('/category/:category', ensureAuthenticated, async (req, res) => {
    const { category } = req.params;

    try {
        const requests = await CustomerRequest.find({ category });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve requests' });
    }
});

module.exports = router;
