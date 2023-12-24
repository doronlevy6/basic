const path = require('path');
const fs = require('fs');
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
function isValidTimestamp(timestamp) {
    const date = new Date(+timestamp);
    return !isNaN(date.getTime());
}






module.exports = {
    loadProvidersData,
    hasSpecialty,
    isAvailable,
    meetsScore,
    filterProviders, isValidTimestamp,

};