const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 3500;

app.use(express.json());
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

// Utility Functions
function loadProvidersData() {
    try {
        return JSON.parse(fs.readFileSync(path.join(__dirname, '../providers/providers.json'), 'utf8'));
    } catch (error) {
        console.error("Error loading provider data:", error);
        throw error; // Rethrow to handle it in the calling context
    }
}

function hasSpecialty(provider, specialty) {
    return provider.specialties.some(spec => spec.toLowerCase() === specialty.toLowerCase());
}

function isAvailable(provider, date) {
    return provider.availableDates.some(d => d.from <= +date && d.to >= +date);
}

function meetsScore(provider, minScore) {
    return provider.score >= (minScore ? +minScore : 0);
}

function filterProviders(providers, specialty, date, minScore) {
    return providers.filter(provider =>
        hasSpecialty(provider, specialty) &&
        isAvailable(provider, date) &&
        meetsScore(provider, minScore)
    ).sort((a, b) => b.score - a.score).map(provider => provider.name);
}

// Route Handlers
app.get('/appointments', (req, res, next) => {
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

app.post('/appointments', (req, res, next) => {
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

app.use((err, req, res, next) => {
    console.error("222", err);
    res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
