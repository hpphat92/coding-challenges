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

const questionSchema = new mongoose.Schema({
    question: {type: String, required: true},
    answers: {type: [String], required: true},
    correctAnswer: {type: String, required: true}
});
const quizSessionSchema = new mongoose.Schema({
    sessionName: {type: String, required: true},
    questionList: {type: [String], required: true},
    timeForEachAnswer: {type: Number},
    createdAt: {type: Number, default: +Date.now()},
    createdBy: {type: String},
    sessionExpiredAt: {type: Number},
});
const playerQuizSessionSchema = new mongoose.Schema({
    sessionId: {type: String, required: true},
    userId: {type: String, required: true},
    createdAt: {type: Number, default: +Date.now()},
    questionList: {type: [String], required: true},
    currentQuestionIdx: {type: Number, required: true, default: 0},
    currentQuestionTimeRequested: {type: Number, default: 0},
    timeForEachAnswer: {type: Number, default: 0},
    score: {type: Number, required: true, default: 0},
});
//#endregion Define schema

module.exports = {
    model: {
        Questions: mongoose.model('questions', questionSchema),
        QuizSession: mongoose.model('quiz_session', quizSessionSchema),
        PlayerQuizSession: mongoose.model('player_quiz_session', playerQuizSessionSchema)
    }
};
