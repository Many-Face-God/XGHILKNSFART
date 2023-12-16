const { mongoose } = require("mongoose");
const ExamActivity = require("../models/exam_activity");
const Result = require("../models/result");
const TheoryAnswer = require("../models/theory_answer");
const Question = require("../models/question.model");
const Exam = require("../models/exam");

module.exports.scoreTheoryQuestion = async (req, res) => {
  // check access
  try {
    // get theory answer id and score
    const { score } = req.body;
    const theoryAnswerId = req.params.theoryAnswerId;
    const userId = req.decoded.id;

    const fetchedAnswer = req.theoryAnswer;

    if (!score || score < 0) {
      return res.status(400).json({
        type: "failure",
        message:
          "please provide a valid score that is in the range of 0 to question point",
      });
    }

    if (score > fetchedAnswer.question.point) {
      return res.status(400).json({
        type: "failure",
        message: `score can't be greater than ${fetchedAnswer.question.point}  `,
      });
    }

    // update theory answer score
    const updatedTheory = await TheoryAnswer.findByIdAndUpdate(
      theoryAnswerId,
      {
        score: score,
        scoredBy: userId,
      },
      {
        runValidators: true,
        new: true,
      }
    );

    return res.status(200).json({
      type: "success",
      message: "Score updated successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Server Error",
      error: err.message,
    });
  }
};

module.exports.markTheory = async (req, res) => {
  // check access control
  try {
    const userId = req.decoded.id;
    const candidateId = req.params.candidateId;
    const fetchedCandidate = req.candidate;

    // get candidate id and exam activity id

    let fetchedResult,
      cleared = false,
      flagged = false,
      percentage = 0,
      resultCount = 0,
      approvedResultsCount = 0,
      flaggedResultsCount = 0;

    cleared = fetchedCandidate.examActivities[0].isCleared;
    flagged = fetchedCandidate.examActivities[0].isFlagged;

    if (!fetchedCandidate.results || !fetchedCandidate.results[0]) {
      let questions = await Question.find({ exam: fetchedCandidate.exam });
      // if (questions.length > 0) {
      //   return res.status(200).json({
      //     type: "failure",
      //     message: "please mark objective questions first.",
      //   });
      // }

      // filter multichoice questions

      // check flag
      if (flagged) {
        flagged = true;
        flaggedResultsCount = 1;
      } else {
        cleared = true;
        approvedResultsCount = 1;
      }

      let pointToBeDeducted =
        fetchedCandidate.examActivities[0].pointToBeDeducted;
      // create result
      const newResult = await Result.create({
        examActivity: fetchedCandidate.examActivities[0]._id,
        candidate: fetchedCandidate._id,
        exam: fetchedCandidate.exam,
        isFlagged: flagged,
        isCleared: cleared,
        score: 0,
        initialScore: 0,
        totalQuestions: questions.length,
        right: 0,
        wrong: 0,
        notAnswered: 0,
        answered: 0,
        deductedMark: pointToBeDeducted,
        percentage: 0,
        totalExamScore: fetchedCandidate.exam.maxTheoryScore,
        multiChoiceFailedCount: 0,
        multiChoiceCorrectCount: 0,
      });

      fetchedResult = newResult;
      fetchedResult.score -= pointToBeDeducted;
      resultCount = 1;
    }

    const fetchedTheoryAnswer = await TheoryAnswer.find({
      candidate: candidateId,
    });

    if (!fetchedTheoryAnswer || fetchedTheoryAnswer.length < 1) {
      return res.status(404).json({
        type: "failure",
        message: "No theory answer found",
      });
    }

    let totalScore = 0;
    for (let i = 0; i < fetchedTheoryAnswer.length; i++) {
      let theoryAnswer = fetchedTheoryAnswer[i];
      // if (theoryAnswer.score !== 0 && !theoryAnswer.score) {
      // console.log({ score: theoryAnswer.score });
      // console.log(typeof theoryAnswer.score !== "number");
      if (typeof theoryAnswer.score !== "number") {
        // throw exception
        return res.status(400).json({
          type: "failure",
          message: "Please provide a score for all theory answers",
        });
      }
      totalScore += theoryAnswer.score;
    }

    if (!fetchedResult) fetchedResult = fetchedCandidate.results[0];

    // update total exam scores, number of questions
    fetchedResult.score += totalScore;
    percentage = fetchedResult.percentage;

    // calc percentage
    if (totalScore > 0) {
      percentage = 100 * (fetchedResult.score / fetchedResult.totalExamScore);
      percentage = percentage.toFixed(0);
    }

    // console.log({
    //   percentage: percentage,
    //   score: fetchedResult.score,
    //   questionCount: fetchedResult.totalQuestions,
    //   totalExamScore: fetchedResult.totalExamScore,
    // });

    const updatedResult = await Result.findByIdAndUpdate(
      fetchedResult._id,
      {
        percentage: percentage,
        $inc: {
          score: totalScore,
          initialScore: totalScore,
          answered: fetchedTheoryAnswer.length,
        },
      },
      {
        runValidators: true,
      }
    );

    await TheoryAnswer.updateMany(
      { candidate: candidateId },
      {
        $set: { isMarked: true },
      }
    );

    // // update examActivity
    await ExamActivity.findByIdAndUpdate(
      updatedResult.examActivity,
      {
        isMarked: true,
      },
      {
        runValidators: true,
      }
    );

    // Update exam
    await Exam.findByIdAndUpdate(updatedResult.exam, {
      $push: { results: updatedResult._id },
      $inc: {
        resultCount: resultCount,
        approvedResultsCount: approvedResultsCount,
        flaggedResultsCount: flaggedResultsCount,
        unmarkedResultCount: -1,
        markedResultCount: 1,
      },
    });

    return res.status(200).json({
      type: "success",
      message: "Theory marked successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Server Error",
      error: err.message,
    });
  }
};
