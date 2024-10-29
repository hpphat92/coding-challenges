const mongoose = require('mongoose');

// MongoDB connection URI
const mongoURI = 'mongodb://localhost:27017/elsa_ui'; // Replace with your database name

// Connect to MongoDB
mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

//#region Define schema
const playersSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    displayName: {type: String, required: true},
});
//#endregion Define schema

module.exports = {
    model: {
        Players: mongoose.model('Players', playersSchema)
    }
};
