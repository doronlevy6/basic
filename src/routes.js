const express = require('express');
const { loadProvidersData, hasSpecialty, isAvailable, meetsScore, filterProviders, isValidTimestamp } = require('./utils');
const router = express.Router();

router.get('/appointments', (req, res, next) => {

    const { specialty, date, minScore } = req.query;

    // Log for received query parameters
    console.log(`Received GET /appointments request with query params: Specialty - ${specialty}, Date - ${date}, MinScore - ${minScore}`);

    // Check for missing parameters
    if (!specialty) {
        console.log('GET /appointments: Missing specialty parameter');
        return res.status(400).send('Missing specialty parameter');
    }
    if (!date) {
        console.log('GET /appointments: Missing date parameter');
        return res.status(400).send('Missing date parameter');
    }

    // Validate date
    if (!isValidTimestamp(date)) {
        console.log(`GET /appointments: Invalid date format - ${date}`);
        return res.status(400).send('Invalid date format');
    }


    // Load and filter providers data
    const providers = loadProvidersData();
    const results = filterProviders(providers, specialty, date, minScore);

    // Log successful data retrieval
    console.log(`GET /appointments: Successfully retrieved ${results.length} providers`);

    res.json(results);

});

router.post('/appointments', (req, res, next) => {

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

});
module.exports = router