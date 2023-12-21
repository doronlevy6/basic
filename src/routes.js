const express = require('express');
const { loadProvidersData, hasSpecialty, isAvailable, meetsScore, filterProviders } = require('./utils');
const router = express.Router();

router.get('/appointments', (req, res, next) => {
    try {
        const { specialty, date, minScore } = req.query;

        if (!specialty || !date || isNaN(+date)) {

            return res.status(400).send('Bad Request');
        }

        const providers = loadProvidersData();
        const results = filterProviders(providers, specialty, date, minScore);

        res.json(results);
    } catch (error) {
        next(error); // Pass errors to the error handling middleware
    }
});

router.post('/appointments', (req, res, next) => {
    try {
        const { name, date } = req.body;

        const providers = loadProvidersData();
        const provider = providers.find(p => p.name === name);

        if (!provider) {

            return res.status(400).send('Provider not found');
        }

        if (!isAvailable(provider, date)) {
            return res.status(400).send('Provider is not available at this time');
        }

        // Save appointment logic here

        res.send('Appointment set successfully');
    } catch (error) {
        next(error); // Pass errors to the error handling middleware
    }
});
module.exports = router