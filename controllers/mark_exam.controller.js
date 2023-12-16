const Candidate = require("../models/candidate.model");
const Exam = require("../models/exam");
const ExamActivity = require("../models/exam_activity");
const Question = require("../models/question.model");
const Result = require("../models/result");
const TheoryAnswer = require("../models/theory_answer");

const markExamExams = async (req, res) => {
  try {
    const exam = req.exam;

    const fetchedExamActivities = await ExamActivity.find({
      exam: exam._id,
      isMarked: false,
    });

    if (fetchedExamActivities.length < 1) {
      return res.status(400).json({
        type: "failure",
        message: "All exams have been marked",
      });
    }

    let unmarkedExamActivities = new Array(),
      markFailed = false;
    fetchedExamActivities.forEach((examActivity) => {
      if (!examActivity.result) unmarkedExamActivities.push(examActivity);
    });

    if (unmarkedExamActivities.length < 1) {
      return res.status(400).json({
        type: "failure",
        message:
          "All objectives and multichoice questions have been marked successfully. Please proceed to the result screen to mark theory questions",
      });
    }

    for (let i = 0; i < unmarkedExamActivities.length; i++) {
      let markAll = await markObjectives(
        unmarkedExamActivities[i],
        exam.maxTheoryScore
      );
      if (!markAll) markFailed = true;
    }

    if (markFailed)
      return res.status(400).json({
        type: "failure",
        message: "failed to mark some exams",
      });

    return res.status(200).json({
      type: "success",
      message: "Exams marked Successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      type: "failure",
      message: "Server Error",
      error: err.message,
    });
  }
};

const markObjectives = async (examActivity, maxTheoryScore) => {
  try {
    const exam = examActivity.exam;

    let notAnsweredCount = 0,
      objectiveFailedCount = 0,
      score = 0,
      totalExamScore = 0,
      objectiveCorrectCount = 0,
      multiChoiceCorrectCount = 0,
      attemptedQuestionsCount = 0,
      multiChoiceFailedCount = 0,
      flaggedResultsCount = 0,
      approvedResultsCount = 0,
      initialScore = 0,
      percentage = 0,
      markedResultCount = 0,
      unmarkedResultCount = 0,
      cleared = false,
      flagged = false,
      isMarked = false;

    // Fetch main Exam Questions
    const examQuestions = await Question.find({ exam: exam })
      .select(["_id", "question", "answer", "numberOfAnswers", "type"])
      .lean();

    let questionMap = new Map();
    // loop through the exam questions
    // if (typeof examActivity.attemptedQuestions[0].questionId === "string") {
    examQuestions.forEach((question) => {
      if (question.type != "theory") {
        // Storing the main exam questions in a map
        questionMap.set("" + question._id, question);

        if (question.numberOfAnswers == 1) {
          totalExamScore += examActivity.objPoint;
        } else {
          totalExamScore +=
            question.numberOfAnswers * examActivity.multiChoicePoint;
        }
      }
    });
    // } else {
    //   examQuestions.forEach((question) => {
    //     if (question.type != "theory") {
    //       // Storing the main exam questions in a map
    //       questionMap.set(question._id, question);

    //       if (question.numberOfAnswers == 1) {
    //         totalExamScore += examActivity.objPoint;
    //       } else {
    //         totalExamScore +=
    //           question.numberOfAnswers * examActivity.multiChoicePoint;
    //       }
    //     }
    //   });
    // }

    if (examActivity.attemptedQuestions.length > 0) {
      examActivity.attemptedQuestions.forEach((question) => {
        let examQuestion = questionMap.get(question.questionId);
        question.question = examQuestion.question;
        question.image = examQuestion.imageUrl;

        // myArray?.length ? true : false
        // typeof emptyArray != "undefined" && emptyArray != null && emptyArray.length != null && emptyArray.length > 0
        if (!question.selected || question.selected.length < 1) {
          question.correct = false;
          notAnsweredCount += 1;
        } else if (examQuestion.numberOfAnswers == 1) {
          attemptedQuestionsCount += 1;
          if (question.selected[0] === examQuestion.answer[0]) {
            //  if they are equal, set correct to true
            question.correct = true;
            objectiveCorrectCount += 1;
          } else {
            //  if they are not equal, set correct to false
            question.correct = false;
            objectiveFailedCount += 1;
          }
        } else {
          attemptedQuestionsCount += 1;
          // if question has multiple answers
          let answerSummary = new Array();
          question.selected.forEach((answer) => {
            let summary = {
              selected: answer,
              correct: false,
            };
            if (examQuestion.answer.includes(answer)) {
              summary.correct = true;
              multiChoiceCorrectCount += 1;
            } else {
              // if answer is wrong
              multiChoiceFailedCount += 1;
            }
            answerSummary.push(summary);
          });
          question.answerSummary = answerSummary;
        }
      });
    }

    if (objectiveCorrectCount > 0)
      score = objectiveCorrectCount * examActivity.objPoint;
    if (multiChoiceCorrectCount > 0)
      score += multiChoiceCorrectCount * examActivity.multiChoicePoint;

    // Return the exam activity, correct count, failed count, not answered count

    notAnsweredCount = examQuestions.length - attemptedQuestionsCount;

    if (examActivity.isFlagged) {
      flagged = true;
      flaggedResultsCount = 1;
    } else {
      cleared = true;
      approvedResultsCount = 1;
    }

    // save initial score
    initialScore = score;
    // handle deducted points
    if (examActivity.pointToBeDeducted > 0)
      score -= examActivity.pointToBeDeducted;

    // handle when student did not attempt theory questions
    // if no theory
    const theoryQuestions = await TheoryAnswer.find({
      candidate: examActivity.candidate,
    });
    // fetch TheoryAnswer
    if (!examActivity.examMode.theory && theoryQuestions.length < 1) {
      isMarked = true;
      markedResultCount = 1;
      unmarkedResultCount = -1;
      if (score < 0) {
        score = 0;
      }
    }

    totalExamScore += maxTheoryScore;

    if (score > 0) {
      percentage = 100 * (score / totalExamScore);
      percentage = percentage.toFixed(0);
    }

    // console.log({
    //   totalExamScore: totalExamScore,
    //   score: score,
    //   initialScore: initialScore,
    //   percentage: percentage,
    //   attemptedQuestionsCount: attemptedQuestionsCount,
    //   multiChoiceFailedCount: multiChoiceFailedCount,
    //   multiChoiceCorrectCount: multiChoiceCorrectCount,
    //   notAnsweredCount: notAnsweredCount,
    //   objectiveCorrectCount: objectiveCorrectCount,
    //   objectiveFailedCount: objectiveFailedCount,
    //   totalQuestions: examQuestions.length,
    // });

    // create Result
    const createResult = await Result.create({
      examActivity: examActivity._id,
      exam: examActivity.exam,
      candidate: examActivity.candidate,
      isFlagged: flagged,
      right: objectiveCorrectCount,
      wrong: objectiveFailedCount,
      isCleared: cleared,
      notAnswered: notAnsweredCount,
      answered: attemptedQuestionsCount,
      deductedMark: examActivity.pointToBeDeducted,
      score: score,
      initialScore: initialScore,
      percentage: percentage,
      totalExamScore: totalExamScore,
      multiChoiceFailedCount: multiChoiceFailedCount,
      multiChoiceCorrectCount: multiChoiceCorrectCount,
      totalQuestions: examQuestions.length,
    });
    let result = createResult._id,
      status = "closed",
      attemptedQuestions = examActivity.attemptedQuestions;

    await ExamActivity.findByIdAndUpdate(examActivity._id, {
      attemptedQuestions,
      result,
      isMarked,
      status,
    });

    // Update exam
    await Exam.findByIdAndUpdate(examActivity.exam, {
      $push: { results: result },
      $inc: {
        unmarkedResultCount: unmarkedResultCount,
        markedResultCount: markedResultCount,
        resultCount: 1,
        approvedResultsCount: approvedResultsCount,
        flaggedResultsCount: flaggedResultsCount,
      },
    });

    // update candidate
    await Candidate.findByIdAndUpdate(examActivity.candidate, {
      $push: { results: result },
      $inc: { resultCount: 1 },
    });

    return true;
  } catch (err) {
    console.log(err.message);
    return false;
  }
};

module.exports = {
  markExamExams,
};
