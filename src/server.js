const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 3500;

app.use(express.json());

// Utility Functions
function loadProvidersData() {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../providers/providers.json'), 'utf8'));
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
app.get('/appointments', (req, res) => {
    const { specialty, date, minScore } = req.query;

    if (!specialty || !date || isNaN(+date)) {
        return res.status(400).send('Bad Request');
    }

    const providers = loadProvidersData();
    const results = filterProviders(providers, specialty, date, minScore);

    res.json(results);
});

app.post('/appointments', (req, res) => {
    const { name, date } = req.body;

    const providers = loadProvidersData();
    const provider = providers.find(p => p.name === name);

    if (!provider) {
        return res.status(400).send('Provider not found');
    }

    if (!isAvailable(provider, date)) {
        return res.status(400).send('Provider is not available at this time');
    }

    // Here you can add logic to save the appointment.
    res.send('Appointment set successfully');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
