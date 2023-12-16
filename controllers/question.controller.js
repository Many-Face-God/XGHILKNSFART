const Question = require("../models/question.model");
const Exam = require("../models/exam");

// can only be aaccessed by the host and supervisors with priveleges

module.exports.createQuestions = async (req, res) => {
  try {
    //getting questions from request body
    const questionArray = req.body.questions;
    if (!questionArray || questionArray.length < 1) {
      return res.status(400).json({
        type: "failure",
        message: "required fields are not provided",
      });
    }

    let newQuestionArray = new Array(),
      exam = req.exam,
      totalTheoryScore = 0;

    for (let i = 0; i < questionArray.length; i++) {
      var question = questionArray[i];
      if (!question.question) {
        return res.status(400).json({
          type: "failure",
          message: `Please provide a question statement for question ${i + 1}`,
        });
      }

      if (question.type === "theory") {
        if (!question.point || question.point < 1) {
          return res.status(400).json({
            type: "failure",
            message: `Please provide point value for question ${i + 1}`,
          });
        }
        var newQuestion = {
          imgUrl: question.imgUrl,
          question: question.question,
          type: question.type,
          point: question.point,
          exam: exam._id,
        };
        newQuestionArray.push(newQuestion);
        totalTheoryScore += question.point;
      } else if (question.type === "multichoice") {
        if (!question.answer || question.answer.length < 1) {
          return res.status(400).json({
            type: "failure",
            message: `Please provide answers for question ${i + 1}`,
          });
        }
        if (question.options.length <= question.answer.length) {
          return res.status(400).json({
            type: "failure",
            message: `Number of options for question ${
              i + 1
            } must be greater than answers`,
          });
        }
        var newQuestion = {
          imgUrl: question.imgUrl,
          question: question.question,
          answer: question.answer,
          numberOfAnswers: question.answer.length,
          type: question.type,
          options: question.options,
          exam: exam._id,
        };
        newQuestionArray.push(newQuestion);
      } else {
        return res.status(400).json({
          type: "failure",
          message: `Invalid queston type for question ${i + 1}`,
        });
      }
    }

    //inserting questions into the database
    let questions = await Question.collection.insertMany(newQuestionArray);
    if (!questions) {
      return res.status(400).json({
        type: "failure",
        message: "failed to create questions",
      });
    }

    // calculate the number of questions an update the exam Quwstion Count
    await Exam.findByIdAndUpdate(exam._id, {
      $inc: {
        questionCount: newQuestionArray.length,
        maxTheoryScore: totalTheoryScore,
      },
    });

    return res.status(200).json({
      type: "success",
      message: "Questions have been successfully created",
      noOfQuestions: questions.insertedCount,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

module.exports.viewAllQuestions = async (req, res) => {
  try {
    const examId = req.params.examId;
    const exam = req.exam;

    const fetchedQuestions = await Question.find({ exam: examId });

    if (fetchedQuestions.length < 1) {
      return res.status(204).json({
        type: "success",
        message: "Questions list is empty",
        questions: [],
      });
    }
    return res.status(200).json({
      type: "success",
      message: "questions fetched successfully",
      questions: fetchedQuestions,
      examMode: {
        theory: exam.examMode.theory.status,
        objective: exam.examMode.objective.status,
        multichoice: exam.examMode.multiSelect.status,
        subjective: exam.examMode.subjective.status,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "SERVER ERROR",
      error: err.message,
    });
  }
};

module.exports.deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.questionId;

    const exam = req.exam;

    const fetchedQuestion = await exam.findById(questionId);
    if (!fetchedQuestion) {
      return res.status(400).json({
        type: "failure",
        message: "Invalid question Id. Failed to find question",
      });
    }

    await Question.findByIdAndDelete(questionId);

    if (fetchedQuestion.type === "theory") {
      await Exam.findByIdAndUpdate(
        exam._id,
        {
          $inc: {
            // reduce the number of theory questions
            questionCount: -1,
            maxTheoryScore: -fetchedQuestion.point,
          },
        },
        { runValidators: true }
      );
    } else {
      // update exam info
      await Exam.findByIdAndUpdate(
        exam._id,
        {
          $inc: {
            questionCount: -1,
          },
        },
        {
          runValidators: true,
        }
      );
    }

    return res.status(200).json({
      type: "success",
      message: "Question deleted Successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "SERVER ERROR",
      error: err.message,
    });
  }
};

module.exports.updateQuestion = async (req, res) => {
  try {
    const questionId = req.params.questionId;
    var { question, answer, options, imgUrl } = req.body;
    if (!question || !answer || !options) {
      return res.status(400).json({
        type: "failure",
        message: "required fields can't be empty",
      });
    }

    if (options.length <= answer.length) {
      return res.status(400).json({
        type: "failure",
        message: "Number of options must be greater than answers",
      });
    }

    var updatedQuestion;

    if (imgUrl) imgUrl = imgUrl.trim();
    updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      {
        question: question,
        answer: answer,
        numberOfAnswers: answer.length,
        options: options,
        imgUrl: imgUrl,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      type: "success",
      message: "Question updated successfully",
      question: updatedQuestion,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "SERVER ERROR",
      error: err.message,
    });
  }
};

module.exports.updateTheoryQuestion = async (req, res) => {
  try {
    const questionId = req.params.questionId;
    let { question, point, imgUrl } = req.body;
    if (!question || !point) {
      return res.status(400).json({
        type: "failure",
        message: "required fields can't be empty",
      });
    }

    if (point < 1) {
      return res.status(400).json({
        type: "failure",
        message: "question point can't be less than 1",
      });
    }

    if (imgUrl) imgUrl = imgUrl.trim();
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      {
        question: question,
        point: point,
        imgUrl: imgUrl,
      },
      {
        runValidators: true,
        new: false,
      }
    );

    if (updatedQuestion.point != point) {
      // update exam maxTheoryScore
      pointBalance = point - updatedQuestion.point;
      await Exam.findByIdAndUpdate(
        req.exam._id,
        {
          $inc: {
            maxTheoryScore: pointBalance,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    }

    return res.status(200).json({
      type: "success",
      message: "Question updated successfully",
      question: updatedQuestion,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "SERVER ERROR",
      error: err.message,
    });
  }
};
