const sendMail = require("../helpers/sendVerificationMail");
const Candidate = require("../models/candidate.model");
const Result = require("../models/result");
const Exam = require("../models/exam");
const resultTemplate = require("../public/examResult");
const TheoryAnswer = require("../models/theory_answer");

// get Result by id
module.exports.ViewResultById = async (req, res) => {
  try {
    const result_id = req.params.resultId;
    const fetchedResult = await Result.findById(result_id).populate({
      path: "examActivity",
      select: "attemptedQuestions",
      populate: { path: "_id", select: "question" },
    });
    if (!fetchedResult) {
      return res.status(400).json({
        type: "failure",
        message: "Invalid result id",
      });
    }

    return res.status(200).json({
      type: "success",
      message: "Result successfully retrieved",
      result: fetchedResult,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
      error: "err.message",
    });
  }
};
// get result by examActivity id
module.exports.ViewResultByExamActivityId = async (req, res) => {
  try {
    const examActivity_id = req.params.examActivityId;
    const fetchedResult = await Result.findOne({
      examActivity: examActivity_id,
    }).populate({
      path: "examActivity",
      select: "attemptedQuestions",
    });
    if (!fetchedResult) {
      return res.status(400).json({
        type: "failure",
        message: "Invalid examActivity id",
      });
    }

    return res.status(200).json({
      type: "success",
      message: "Result successfully retrieved",
      result: fetchedResult,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
      error: "err.message",
    });
  }
};
// get Results by candidate id
module.exports.ViewResultByCandidateId = async (req, res) => {
  try {
    const candidate_id = req.params.candidateId;
    // check object id

    const fetchedResult = await Result.findOne({
      candidate: candidate_id,
    })
      .populate({
        path: "examActivity",
        select: ["isMarked", "examMode"],
      })
      .populate({
        path: "candidate",
        select: ["firstName", "lastName", "email", "phone"],
      });

    if (!fetchedResult) {
      return res.status(204).json({
        type: "failure",
        message: "Result not found",
      });
    }
    // if is Marked is true
    if (!fetchedResult.examActivity.isMarked) {
      let theoryMessage;
      // request theory questions
      const fetchedTheoryAnswers = await TheoryAnswer.find({
        candidate: candidate_id,
      }).populate({
        path: "question",
        select: ["question", "point", "imgUrl"],
      });

      if (!fetchedTheoryAnswers) {
        theoryMessage = "Theory answers not found";
      }

      return res.status(200).json({
        type: "success",
        message: "Result successfully retrieved",
        result: fetchedResult,
        theoryAnswer: {
          answer: fetchedTheoryAnswers,
          message: theoryMessage,
        },
      });
    }
    return res.status(200).json({
      type: "success",
      message: "Result successfully retrieved",
      result: fetchedResult,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
      error: "err.message",
    });
  }
};

// get Results by exam
module.exports.ViewResultByExam = async (req, res) => {
  try {
    const exam_id = req.params.examId;

    const exam = await Exam.findById(exam_id).select([
      "candidateCount",
      "flaggedResultsCount",
      "approvedResultsCount",
      "flaggedCandidatesCount",
      "resultCount",
      "cancelledResultsCount",
      "markedResultCount",
      "unmarkedResultCount",
    ]);
    if (!exam) {
      return res.status(400).json({
        type: "failure",
        message: "Invalid exam id.",
      });
    }

    const candidates = await Candidate.find({
      exam: exam_id,
      resultCount: { $gt: 0 },
    })
      .select(["firstName", "lastName", "email", "resultCount", "results"])
      .populate({ path: "results", select: ["score", "percentage"] });

    if (!candidates) {
      return res.status(400).json({
        type: "failure",
        message: "Records not found",
        candidates: candidates,
      });
    }

    return res.status(200).json({
      type: "success",
      message: "Results fetched successfully",
      candidates: candidates,
      exam: exam,
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

// get results by user exams
module.exports.ViewAllUserExams = async (req, res) => {
  try {
    const user_id = req.decoded.id;
    // fetch list of exams created by user ordered by date and populate flags (candidateId)
    var fetchedExams = await Exam.find({
      createdBy: user_id,
      isArchived: false,
      resultCount: { $gt: 0 },
    })
      .select(["title", "resultCount", "createdAt", "results"])
      .populate({ path: "results", select: "candidate" })
      .sort({ createdAt: -1 });
    if (!fetchedExams || fetchedExams.length < 1) {
      return res.status(404).json({
        type: "failure",
        message: "No result found",
      });
    }

    var exams = new Array();
    // loop through each exam
    fetchedExams.forEach((element) => {
      var candidateSet = new Set();
      var exam = {
        title: element.title,
        id: element._id,
        resultCount: element.resultCount,
        createdAt: element.createdAt,
      };
      for (i = 0; i < element.results.length; i++) {
        // get the candidate id and add to a set
        candidateSet.add("" + element.results[i].candidate);
      }
      // return set size
      exam.candidateCount = candidateSet.size;
      exams.push(exam);
    });

    return res.status(200).json({
      type: "success",
      message: "Documents retrieved sucessfully",
      exams: exams,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
    });
  }
};

// email results
module.exports.emailResults = async (req, res) => {
  try {
    // fetch exam id from request
    const examId = req.params.examId;
    if (!examId || examId.length !== 24) {
      return res.status(400).json({
        type: "failure",
        message: "Please provide a valid exam id.",
      });
    }
    // fetch all result and populate their candidate and exam
    const fetchedResults = await Result.find({
      exam: examId,
      isCleared: true,
      isCancelled: false,
    })
      .populate({ path: "examActivity", select: ["isMarked"] })
      .populate("candidate")
      .populate("exam");

    // filter results where examActivity.isMarked is true

    if (fetchedResults.length < 1) {
      return res.status(404).json({
        type: "failure",
        message:
          "Cleared results list is empty... if results are present for this exam, please try resolving their flags",
      });
    }
    // email each candidate their result
    let sentResultCount = 0,
      unsentResultCount = 0;
    fetchedResults.forEach(async (result) => {
      if (result.examActivity.isMarked) {
        sentResultCount += 1;
        let msg = resultTemplate(
          result.candidate.firstName,
          result.totalQuestions,
          result.answered,
          result.notAnswered,
          result.deductedMark,
          result.score,
          result.percentage,
          result.exam.title
        );
        await sendMail(msg, "Proctorme Result", result.candidate.email);
      } else {
        unsentResultCount += 1;
      }
    });

    return res.status(200).json({
      type: "success",
      message: `${sentResultCount} Results sent successfully... please note that ${unsentResultCount} results with outstanding flags or that haven't been cleared will not be sent.`,
      data: {
        sentResults: sentResultCount,
        unsentResults: unsentResultCount,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "success",
      message: "Server Error",
      error: err.message,
    });
  }
};

// email result
module.exports.emailCandidateResult = async (req, res) => {
  try {
    // fetch candidate id from request
    const candidateId = req.params.candidateId;

    if (!candidateId) {
      return res.status(400).json({
        type: "failure",
        message: "candidate id is required",
      });
    }

    // fetch candidate from db and populate result
    const candidate = await Candidate.findById(candidateId)
      .populate("results")
      .populate("exam")
      .populate({ path: "examActivity", select: ["isMarked"] });

    if (!candidate) {
      return res.status(400).json({
        type: "failure",
        message: "Invalid candidate's ID",
      });
    }

    // check result count
    if (candidate.resultCount === 0 || !candidate.results) {
      return res.status(400).json({
        type: "failure",
        message: "Candidate has no result",
      });
    }

    const result = candidate.results[0];

    if (!candidate.examActivity.isMarked) {
      return res.status(400).json({
        type: "failure",
        message:
          "candidate result has not been marked. please check to ensure theory questions have been marked.",
      });
    }

    if (!result.isCleared) {
      return res.status(400).json({
        type: "failure",
        message: "Result has not been cleared",
      });
    }

    if (result.isCancelled) {
      return res.status(400).json({
        type: "failure",
        message: "Result has been cancelled",
      });
    }

    // email result to candidate
    let msg = resultTemplate(
      candidate.firstName,
      result.totalQuestions,
      result.answered,
      result.notAnswered,
      result.deductedMark,
      result.score,
      result.percentage,
      candidate.exam.title
    );
    const sent = await sendMail(msg, "Proctorme Result", candidate.email);
    if (sent) {
      return res.status(200).json({
        type: "success",
        message: "Result sent successfully",
      });
    } else {
      throw new Error("Mail not sent");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Server Error",
      error: err.message,
    });
  }
};

module.exports.emailResult = async (req, res) => {
  try {
    const resultId = req.params.resultId;
    if (!resultId) {
      return res.status(400).json({
        type: "failure",
        message: "Result id is required",
      });
    }

    const result = await Result.findById(resultId)
      .populate("candidate")
      .populate("exam")
      .populate({ path: "examActivity", select: ["isMarked"] });
    if (!result) {
      return res.status(400).json({
        type: "failure",
        message: "Result not found",
      });
    }

    if (!result.examActivity.isMarked) {
      return res.status(400).json({
        type: "failure",
        message:
          "candidate result has not been marked. please check to ensure theory questions have been marked.",
      });
    }

    if (!result.isCleared) {
      return res.status(400).json({
        type: "failure",
        message: "Result has not been cleared",
      });
    }

    if (result.isCancelled) {
      return res.status(400).json({
        type: "failure",
        message: "Result has been cancelled",
      });
    }

    let msg = resultTemplate(
      result.candidate.firstName,
      result.totalQuestions,
      result.answered,
      result.notAnswered,
      result.deductedMark,
      result.score,
      result.percentage,
      result.exam.title
    );
    const sent = await sendMail(
      msg,
      "Proctorme Result",
      result.candidate.email
    );

    if (sent) {
      return res.status(200).json({
        type: "success",
        message: "Result sent successfully",
      });
    } else {
      throw new Error("Mail not sent");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Server Error",
      error: err.message,
    });
  }
};

// Endpoint to get all exam result counts
exports.getAllExamResult = async (req, res) => {
  try {
    // aggregate to count all result with its isFlagged field is equal to true
    const flaggedResultCount = await Exam.aggregate([
      {
        $lookup: {
          from: "results",
          localField: "_id",
          foreignField: "exam",
          as: "results",
        },
      },
      {
        $match: {
          "results.isFlagged": true,
        },
      },
      {
        $count: "flaggedResult",
      },
    ]);

    // aggregate to count all of the result
    const allResultCount = await Exam.aggregate([
      {
        $lookup: {
          from: "results",
          localField: "_id",
          foreignField: "exam",
          as: "results",
        },
      },
      {
        $count: "allResult",
      },
    ]);
    return res.status(200).json({ flaggedResultCount, allResultCount });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
