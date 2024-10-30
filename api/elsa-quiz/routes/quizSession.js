var express = require('express');
var lodash = require('lodash');
const db = require("../database");
const {TIME_FOR_EACH_ANSWER_IN_SECONDS} = require("../config");
var router = express.Router();
const socketIO = require('../socket');
const {ObjectId} = require('mongodb');

// New Session
router.post('/', async (req, res) => {
    try {
        const {
            sessionName, createdBy
        } = req.body;

        const existingSession = await db.model.QuizSession.findOne({
            sessionName: {
                $regex: new RegExp(sessionName, 'i')
            }
        });

        if (existingSession) {
            return res.status(400).json({message: 'Session already exists'});
        }

        const questionList = await db.model.Questions.aggregate([{$sample: {size: 5}}, {$project: {_id: 1}}]);

        const questionListId = questionList.map((question) => question._id);
        const newSession = new db.model.QuizSession({
            sessionName,
            questionList: questionListId,
            timeForEachAnswer: TIME_FOR_EACH_ANSWER_IN_SECONDS,
            createdBy,
            sessionExpiredAt: +Date.now() + 1000 * (TIME_FOR_EACH_ANSWER_IN_SECONDS * questionList.length)
        });
        const savedSession = await newSession.save();
        res.status(200).json(savedSession._id);
    } catch (err) {
        res.status(500).json({message: 'Error creating session', error: err.message});
    }
});

// Join session
router.post('/join', async (req, res) => {
    const io = socketIO.getIO();
    try {
        const {
            sessionName, userId
        } = req.body;

        const session = await db.model.QuizSession.findOne({
            sessionName: {
                $regex: new RegExp(sessionName, 'i')
            }
        });

        if (!session) {
            return res.status(400).json({message: 'Session not found'});
        }

        const existingUserSession = await db.model.PlayerQuizSession.find({
            sessionId: session._id, userId,
        });

        if (existingUserSession?.length) {
            return res.status(200).json(existingUserSession[0]._id);
        }

        const questionListId = lodash.shuffle(session.questionList);

        const userSessionDB = new db.model.PlayerQuizSession({
            sessionId: session._id, userId, questionList: questionListId, timeForEachAnswer: session.timeForEachAnswer
        });
        const userSession = await userSessionDB.save();
        const user = await db.model.Players.findById(userId);
        io.emit('joinRoom', {
            user, userSession: userSession._id
        });
        res.status(200).json(userSession._id);
    } catch (err) {
        res.status(500).json({message: 'Error creating user quiz session', error: err.message});
    }
});

// Get All session of a user
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const allSessionsByUserId = await db.model.QuizSession.aggregate([
            {
                $match: {createdBy: userId} // Match documents with the specified userId
            },
            {
                $project: {
                    _id: 1,
                    sessionName: 1
                }
            }
        ])

        res.status(200).json(allSessionsByUserId);
    } catch (err) {
        res.status(500).json({message: 'Error creating session', error: err.message});
    }
});

// Get current question
router.post('/current-questions', async (req, res) => {
    try {
        const {
            userSessionId, userId
        } = req.body;

        const existingUserSession = await db.model.PlayerQuizSession.findById(userSessionId);


        if (!existingUserSession || existingUserSession.userId !== userId) {
            return res.status(400).json({message: 'Session not found'});
        }

        const session = await db.model.QuizSession.findById(existingUserSession.sessionId);
        const user = await db.model.Players.findById(existingUserSession.userId);

        if (existingUserSession.currentQuestionTimeRequested) {
            if (Math.abs(existingUserSession.currentQuestionTimeRequested - +Date.now()) >= 1000 * existingUserSession.timeForEachAnswer) {
                existingUserSession.currentQuestionIdx++;
                existingUserSession.currentQuestionTimeRequested = +Date.now();
                existingUserSession.save();
            }
        } else {
            existingUserSession.currentQuestionTimeRequested = +Date.now();
            existingUserSession.save();
        }


        const currentQuestion = existingUserSession.questionList[existingUserSession.currentQuestionIdx];

        // if (!currentQuestion) {
        //     return res.status(203).json({message: 'Game Successfully done'});
        // }
        let question;

        if (currentQuestion) {
            question = await db.model.Questions.findById(currentQuestion).select({
                question: 1, answers: 1
            });

            if (!question) {
                return res.status(400).json({message: 'Question not found'});
            }
        }

        const allUserBySession = await db.model.PlayerQuizSession.aggregate([{
            $match: {sessionId: existingUserSession.sessionId} // Equivalent to find() query
        }, {
            $lookup: {
                from: "players",            // Collection to join
                let: {userId: "$userId"}, // Pass the userId from PlayerQuizSession
                pipeline: [{
                    $match: {
                        $expr: {
                            $eq: ["$_id", {$toObjectId: "$$userId"}] // Compare ObjectId with converted userId
                        }
                    }
                }], as: "userDetails"           // Alias for the joined data
            }
        }, {
            $unwind: {
                path: "$userDetails",      // Deconstructs the array to get a single user object
                preserveNullAndEmptyArrays: true // Optional: preserves documents if no match found
            }
        }, {
            $project: {
                score: 1, "userDetails.name": 1,      // Include user name from joined data
                "userDetails._id": 1,      // Include user name from joined data
                "userDetails.displayName": 1 // Include display name from joined data
            }
        }]);

        res.status(200).json({
            question, allUserBySession, userDetail: {
                score: existingUserSession.score,
                name: user?.name
            },
            sessionDetail: {
                sessionName: session.sessionName,
                timeForEachAnswer: session.timeForEachAnswer,
                timeLeft: question ? session.timeForEachAnswer - (Date.now() - existingUserSession.currentQuestionTimeRequested) / 1000 : -1,
                questionIdx: existingUserSession.currentQuestionIdx,
                totalQuestion: existingUserSession.questionList.length
            }
        });
    } catch (err) {
        res.status(500).json({message: 'Error getting current question', error: err.message});
    }
});

// Answer the question
router.put('/answer-question', async (req, res) => {
    const io = socketIO.getIO();
    try {
        const {
            userSessionId, userId, answer, questionId
        } = req.body;


        const userSession = await db.model.PlayerQuizSession.findById(userSessionId);

        if (!userSession) {
            return res.status(400).json({message: 'Session not found'});
        }

        const currrentQuestionId = userSession.questionList[userSession.currentQuestionIdx];
        if (questionId !== currrentQuestionId) {
            return res.status(400).json({message: 'Question already answered or time is up for this question'});
        }

        let timeRequiredToAnswer = 0;

        if (userSession.currentQuestionTimeRequested) {
            timeRequiredToAnswer = Math.abs(userSession.currentQuestionTimeRequested - +Date.now()) / 1000;
            if (timeRequiredToAnswer >= userSession.timeForEachAnswer) {
                return res.status(400).json({message: 'Question already answered or time is up for this question'});
            }
        }

        const question = await db.model.Questions.findById(questionId);

        if (!question) {
            return res.status(400).json({message: 'Question not found'});
        }

        if (question.correctAnswer.toLowerCase() === answer.toLowerCase()) {
            const score = Math.ceil((1 - timeRequiredToAnswer / (userSession.timeForEachAnswer || Number.MAX_SAFE_INTEGER)) * 100);

            userSession.score += score;
        }

        userSession.currentQuestionIdx++;
        userSession.currentQuestionTimeRequested = 0;
        await userSession.save();

        io.emit('userStateChanged', userSession);

        res.status(201).json();
    } catch (err) {
        res.status(500).json({message: 'Error getting current question', error: err.message});
    }
});

module.exports = router;
