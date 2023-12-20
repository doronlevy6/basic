const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 3500;

// Parsing JSON bodies for POST
app.use(express.json());


// Load providers data

const providers = JSON.parse(fs.readFileSync(path.join(__dirname, '../providers/providers.json'), 'utf8'));


app.get('/appointments', (req, res) => {
    const { specialty, date, minScore } = req.query;

    if (!specialty || !date || isNaN(+date)) {
        return res.status(400).send('Bad Request');
    }

    const results = providers.filter(provider => {
        // Check specialty
        const hasSpecialty = provider.specialties.some(spec => spec.toLowerCase() === specialty.toLowerCase());

        // Check availability
        const isAvailable = provider.availableDates.some(d => d.from <= +date && d.to >= +date);

        // Check score
        const hasMinScore = provider.score >= +minScore;

        return hasSpecialty && isAvailable && hasMinScore;
    });

    // Order by score and send the names only
    const orderedResults = results.sort((a, b) => b.score - a.score).map(provider => provider.name);


    res.json(orderedResults);
});

app.post('/appointments', (req, res) => {
    const { name, date } = req.body;

    const provider = providers.find(p => p.name === name);
    if (!provider) {
        return res.status(400).send('Provider not found');
    }

    const isAvailable = provider.availableDates.some(d => d.from <= +date && d.to >= +date);
    if (!isAvailable) {
        return res.status(400).send('Provider is not available at this time');
    }

    // Here you can add logic to save the appointment, like writing to a database or another file.
    // For now, let's just return a successful message.
    res.send('Appointment set successfully');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

