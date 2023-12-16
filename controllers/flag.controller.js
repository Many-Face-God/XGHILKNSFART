const Flag = require("../models/flag");
const ExamActivity = require("../models/exam_activity");
const Exam = require("../models/exam");
const Result = require("../models/result");
const Candidate = require("../models/candidate.model");

// Endpoint to view userExams
module.exports.ViewAllUserExams = async (req, res) => {
  try {
    const user_id = req.decoded.id;
    // fetch list of exams created by user ordered by date and populate flags (candidateId)
    var fetchedExams = await Exam.find({
      createdBy: user_id,
      isArchived: false,
      flagCount: { $gt: 0 },
    })
      .select(["title", "flagCount", "imageUrl", "createdAt", "flags"])
      .populate({ path: "flags", select: "candidate" })
      .sort({ createdAt: -1 });
    if (!fetchedExams || fetchedExams.length < 1) {
      return res.status(204).json({
        type: "success",
        message: "flagged exams is empty",
        exams: [],
      });
    }

    var exams = new Array();
    // loop through each exam
    fetchedExams.forEach((element) => {
      let candidateSet = new Set();
      let exam = {
        title: element.title,
        id: element._id,
        flagCount: element.flagCount,
        createdAt: element.createdAt,
      };
      for (i = 0; i < element.flags.length; i++) {
        // get the candidate id and add to a set
        candidateSet.add("" + element.flags[i].candidate);
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

// Endpoint to view flagged Exam
module.exports.ViewFlaggedExam = async (req, res) => {
  try {
    const exam_id = req.params.examId;

    const exam = await Exam.findById(exam_id).select([
      "candidateCount",
      "flaggedResultsCount",
      "approvedResultsCount",
      "flaggedCandidatesCount",
      "flagCount",
    ]);
    if (!exam) {
      return res.status(400).json({
        type: "failure",
        message: "Invalid exam id.",
      });
    }

    const candidates = await Candidate.find({
      exam: exam_id,
      flagCount: { $gt: 0 },
    }).select([
      "firstName",
      "lastName",
      "email",
      "imageUrl",
      "flagCount",
      "flags",
    ]);

    if (!candidates) {
      return res.status(404).json({
        type: "failure",
        message: "Records not found",
        candidates: candidates,
      });
    }
    return res.status(200).json({
      type: "success",
      message: "Flags fetched successfully",
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

// Endpoint to view flag by id
module.exports.ViewFlagById = async (req, res) => {
  try {
    const flag_id = req.params.flagId;

    const fetchedFlag = await Flag.findById(flag_id)
      .populate({
        path: "clearedBy",
        select: "email",
      })
      .populate("exam", "title")
      .populate({ path: "candidate", select: ["email", "imageUrl"] });

    if (!fetchedFlag) {
      return res.status(400).json({
        type: "failure",
        message: "Invalid flag id",
      });
    }

    return res.status(200).json({
      type: "failure",
      message: "Flag fetched successfully",
      flag: fetchedFlag,
    });
  } catch (err) {
    return res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Endpoint to view all flagged attempt by candidates id
module.exports.getAllFlaggedAttemptByCandidateId = async (req, res) => {
  const candidate_id = req.params.candidateId;
  try {
    // get the candidate
    const fetchedCandidate = await Candidate.findById(candidate_id);
    if (!fetchedCandidate) {
      return res.status(404).json({
        type: "failure",
        message: "Candidate not found",
      });
    }

    // Activity count === 0
    if (
      fetchedCandidate.examActivities.length < 1 &&
      fetchedCandidate.activityCount === 0
    ) {
      return res.status(400).json({
        type: "failure",
        message: "Candidate have not attempted the exam",
      });
    }
    // Activity count === 1
    else if (
      fetchedCandidate.examActivities.length === 1 &&
      fetchedCandidate.activityCount === 1
    ) {
      var fetchedFlags = await Flag.find({
        examActivity: fetchedCandidate.examActivities[0],
      });
      if (!fetchedFlags) {
        return res.status(404).json({
          type: "failure",
          message: "No flag found",
        });
      }
      if (fetchedFlags.length < 1) {
        return res.status(204).json({
          type: "success",
          message: "No flag found",
          flags: [],
        });
      }
      return res.status(200).json({
        type: "success",
        message: "Flags fetched successfully",
        flags: fetchedFlags,
        candidate: {
          id: fetchedCandidate._id,
          firstName: fetchedCandidate.firstName,
          lastName: fetchedCandidate.lastName,
          email: fetchedCandidate.email,
          imageUrl: fetchedCandidate.imageUrl,
        },
      });
    }
    // Activity count > 1
    else if (
      fetchedCandidate.examActivities.length > 1 &&
      fetchedCandidate.activityCount > 1
    ) {
      const fetchedExamActivities = await ExamActivity.find({
        candidate: candidate_id,
      })
        .select(["_id"])
        .populate("flags");
      if (!fetchedExamActivities) {
        return res.status(404).json({
          type: "failure",
          message: "ExamActivities  not found",
        });
      }
      return res.status(200).json({
        type: "success",
        message: "Flags fetched successfully",
        examActivities: fetchedExamActivities,
        candidate: {
          id: fetchedCandidate._id,
          firstName: fetchedCandidate.firstName,
          lastName: fetchedCandidate.lastName,
          email: fetchedCandidate.email,
          imageUrl: fetchedCandidate.imageUrl,
        },
      });
    }
    throw new Error("Something went wrong");
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Endpoint to clear flag
module.exports.passClearFlag = async (req, res) => {
  // check if user has permission to clear flag
  try {
    // get the flag
    const flag_id = req.params.flagId;
    const user_id = req.decoded.id;
    const fetchedFlag = await Flag.findById(flag_id).populate({
      path: "examActivity",
      select: ["isMarked"],
    });
    if (!fetchedFlag) {
      return res.status(400).json({
        type: "failure",
        message: "Invalid flag id",
      });
    }

    // check if flag has been previously cleared
    if (fetchedFlag.isCleared) {
      return res.status(400).json({
        type: "failure",
        message: "flag has already been cleared",
      });
    }

    if (!fetchedFlag.examActivity.isMarked) {
      return res.status(400).json({
        type: "failure",
        message: "Please mark theory questions before attempting to clear flag",
      });
    }

    // update flag, set cleared = true, penalty = "none", clearedBy = userId;
    const updatedFlag = await Flag.findByIdAndUpdate(flag_id, {
      isCleared: true,
      penalty: "none",
      clearedBy: user_id,
    });

    // check if all flags belonging to d examactivity has been cleared
    // fetch examActivity by id and populate flags
    const fetchedExamActivity = await ExamActivity.findById(
      updatedFlag.examActivity
    ).populate("flags");
    //  if for each flag, isCleared is true, then set result.isCleared to true

    var clearedFlags = false;
    for (let i = 0; i < fetchedExamActivity.flags.length; i++) {
      var flag = fetchedExamActivity.flags[i];
      // check if the flag is cleared
      if (flag.isCleared) {
        clearedFlags = true;
      } else {
        clearedFlags = false;
        break;
      }
    }

    // if clearedFlags is true
    if (clearedFlags) {
      // update result.isCleared to true
      await Result.findByIdAndUpdate(fetchedExamActivity.result, {
        isCleared: true,
      });

      await ExamActivity.findByIdAndUpdate(
        fetchedExamActivity._id,
        {
          isFlagged: false,
        },
        {
          runValidators: true,
        }
      );

      // reduce the number of flagged Results
      await Exam.findByIdAndUpdate(fetchedExamActivity.exam, {
        $inc: {
          flaggedResultsCount: -1,
          approvedResultsCount: 1,
          flaggedCandidatesCount: -1,
        },
      });

      // update exam flaggedResultCount -1
    }

    return res.status(200).json({
      type: "success",
      message: "The operation was successful",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
      merror: err.message,
    });
  }
};

// Endpoint to clear flag by examactivity
module.exports.passClearExamActivityFlags = async (req, res) => {
  // check if user has permission to clear flag
  try {
    // update exam activity flags
    const examactivity_id = req.params.examactivityId;
    const user_id = req.decoded.id;
    const fetchedExamActivity = await ExamActivity.findById(
      examactivity_id
    ).select(["isMarked", "isFlagged"]);

    if (!fetchedExamActivity.isFlagged) {
      return res.status(400).json({
        type: "failure",
        message: "flags have already been cleared",
      });
    }

    if (!fetchedExamActivity.isMarked) {
      return res.status(400).json({
        type: "failure",
        message: "Please mark theory questions before attempting to clear flag",
      });
    }

    await Flag.updateMany(
      { examactivity: examactivity_id },
      { isCleared: true, clearedBy: user_id, penalty: "none" }
    );

    // Update result
    await Result.updateMany(
      {
        examactivity: examactivity_id,
      },
      {
        isCleared: true,
      }
    );

    // update examActivity
    await ExamActivity.findByIdAndUpdate(
      examactivity_id,
      {
        isFlagged: false,
      },
      {
        runValidators: true,
      }
    );

    // update exam flaggedResultCount

    return res.status(200).json({
      type: "success",
      message: "ExamActivity flags cleared successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
      merror: err.message,
    });
  }
};

// Endpoint to clear flag by candidate
module.exports.passClearCandidateFlags = async (req, res) => {
  // check if user has permission to clear flag
  try {
    // update exam activity flags
    const candidate_id = req.params.candidateId;
    const user_id = req.decoded.id;

    const fetchedExamActivity = await ExamActivity.findOne({
      candidate: candidate_id,
    }).select(["isMarked", "isFlagged"]);

    if (!fetchedExamActivity.isFlagged) {
      return res.status(400).json({
        type: "failure",
        message: "Candidate flags has already been cleared",
      });
    }

    if (!fetchedExamActivity.isMarked) {
      return res.status(400).json({
        type: "failure",
        message: "Please mark theory questions before attempting to clear flag",
      });
    }

    const fetchedFlags = await Flag.find({
      candidate: candidate_id,
      isCleared: false,
    });
    if (fetchedFlags.length < 1) {
      return res.status(404).json({
        success: false,
        message: "Candidate has no outstanding flag",
      });
    }

    await Flag.updateMany(
      { candidate: candidate_id, isCleared: false },
      { isCleared: true, clearedBy: user_id, penalty: "none" }
    );

    // Update result
    await Result.updateMany(
      {
        candidate: candidate_id,
      },
      {
        isCleared: true,
      }
    );

    // update flagged result count
    // reduce the number of flagged Results
    await Exam.findByIdAndUpdate(fetchedExamActivity.exam, {
      $inc: {
        flaggedResultsCount: -1,
        approvedResultsCount: 1,
        flaggedCandidatesCount: -1,
      },
    });

    return res.status(200).json({
      type: "success",
      message: "Candidate flags cleared successfully",
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

// Endpoint to clear flag by exam
module.exports.passClearExamFlags = async (req, res) => {
  try {
    // update exam activity flags
    const exam_id = req.params.examId;
    const user_id = req.decoded.id;

    await Flag.updateMany(
      { exam: exam_id, isCleared: false },
      { isCleared: true, clearedBy: user_id, penalty: "none" }
    );

    // update candidates

    // Update result
    const updatedResults = await Result.updateMany(
      {
        exam: exam_id,
        isCleared: false,
      },
      {
        isCleared: true,
      }
    );

    // update examActivity
    // set is flagged to false
    await ExamActivity.updateMany(
      {
        exam: exam_id,
        isFlagged: true,
      },
      {
        isFlagged: false,
      }
    );

    // reduce the number of flagged Results
    await Exam.findByIdAndUpdate(exam_id, {
      flaggedResultsCount: 0,
      $inc: {
        approvedResultsCount: updatedResults.nModified,
      },
    });

    return res.status(200).json({
      type: "success",
      message: "Exam flags cleared successfully",
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

// Endpoint to penalized flagged attempt
exports.penalizeFlaggedAttempt = async (req, res) => {
  try {
    const flag_id = req.params.flagId;
    const user_id = req.decoded.id;
    const { penalty } = req.body;
    const { deductedMark } = req.body;

    if (!deductedMark) {
      return res.status(400).json({
        type: "failure",
        message: "BAD REQUEST!!!...Deducted mark is required",
      });
    }

    // check penalty
    if (!penalty || penalty != "deduct mark") {
      return res.status(400).json({
        type: "failure",
        message: "BAD REQUEST!!!...Penalty is missing or invalid",
      });
    }

    const fetchedFlag = await Flag.findById(flag_id).populate("examActivity");
    if (!fetchedFlag) {
      return res.status(400).json({
        type: "failure",
        message: "BAD REQUEST!!!...Invalid flag id",
      });
    }

    if (fetchedFlag.isCleared) {
      return res.status(400).json({
        type: "failure",
        message: "flag has already been cleared",
      });
    }

    if (!fetchedFlag.examActivity.isMarked) {
      return res.status(400).json({
        type: "failure",
        message: "Please mark theory questions before attempting to clear flag",
      });
    }

    if (penalty === "deduct mark") {
      // get candidate result from the exam activity
      const fetchedResult = await Result.findById(
        fetchedFlag.examActivity.result
      );
      if (!fetchedResult) {
        return res.status(400).json({
          type: "failure",
          message: "BAD REQUEST!!!...Unable to fetch result",
        });
      }

      // check if result || examActivity is marked

      // deduct mark from result score
      if (deductedMark > fetchedResult.score) {
        return res.status(400).json({
          type: "failure",
          message: "Deducted mark can't be greater than candidate score",
        });
      }
      const newScore = fetchedResult.score - deductedMark;
      const newDeductedMark = fetchedResult.deductedMark + deductedMark;
      var percentage = 100 * (newScore / fetchedResult.totalExamScore);
      percentage = percentage.toFixed(0);

      // update new result score
      await Result.findByIdAndUpdate(fetchedResult._id, {
        score: newScore,
        deductedMark: newDeductedMark,
        percentage: percentage,
      });
    }

    // } then
    // update flag set isCleared =  true, clearedBy = userId, penalty = "deduct mark" || "nullify", deductedMark = deduct mark.
    await Flag.findByIdAndUpdate(flag_id, {
      isCleared: true,
      penalty: penalty,
      clearedBy: user_id,
      deductedMark: deductedMark,
    });

    // check if all examActivity flags has been cleared
    const checkFlags = await Flag.find({
      examactivity: fetchedFlag.examActivity,
      isCleared: false,
    });
    if (checkFlags.length < 1) {
      const updatedResult = await Result.findOneAndUpdate(
        { examActivity: fetchedFlag.examActivity },
        {
          isCleared: true,
        }
      );

      // reduce the number of flagged Results
      await Exam.findByIdAndUpdate(updatedResult.exam, {
        $inc: {
          flaggedResultsCount: -1,
          approvedResultsCount: 1,
          flaggedCandidatesCount: -1,
        },
      });
    }

    return res.status(200).json({
      type: "success",
      message: "Flag penalized successfully",
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

// Endpoint to penalized flagged attempt
exports.penalizeExamActivityFlaggedAttempts = async (req, res) => {
  try {
    const user_id = req.decoded.id;
    const examActivity_id = req.params.examactivityId;
    const { penalty } = req.body;
    const { deductedMark } = req.body || 0;

    // check penalty
    if (!penalty) {
      return res.status(400).json({
        type: "failure",
        message: "BAD REQUEST!!!...Penalty is required",
      });
    }

    const fetchedExamActivity = await ExamActivity.findById(examActivity_id);
    if (!fetchedExamActivity) {
      return res.status(400).json({
        type: "failure",
        message: "invalid exam id",
      });
    }

    if (!fetchedExamActivity.isFlagged) {
      return res.status(400).json({
        type: "failure",
        message: "flags have already been cleared",
      });
    }

    if (!fetchedExamActivity.isMarked) {
      return res.status(400).json({
        type: "failure",
        message: "Please mark theory questions before attempting to clear flag",
      });
    }

    // check if examActivity || result is Marked

    if (penalty === "nullify exam") {
      // if nullify update result and examActivity, set cancelled = true
      await ExamActivity.findByIdAndUpdate(examActivity_id, {
        isCancelled: true,
      });
      await Result.findByIdAndUpdate(fetchedExamActivity.result, {
        isCancelled: true,
      });
    }
    if (penalty === "deduct mark") {
      if (!deductedMark) {
        return res.status(400).json({
          type: "failure",
          message: "BAD REQUEST!!!...Deducted mark is required",
        });
      }
      // get candidate result from the exam activity
      const fetchedResult = await Result.findById(fetchedExamActivity.result);
      if (!fetchedResult) {
        return res.status(400).json({
          type: "failure",
          message: "BAD REQUEST!!!...Unable to fetch result",
        });
      }
      // deduct mark from result score
      if (deductedMark > fetchedResult.score) {
        return res.status(400).json({
          type: "failure",
          message: "Deducted mark can't be greater than candidate score",
        });
      }
      fetchedResult.score = fetchedResult.score - deductedMark;
      // update new result score
      await Result.findByIdAndUpdate(fetchedResult._id, {
        score: fetchedResult.score,
      });
    }

    // } then
    // update flag set isCleared =  true, clearedBy = userId, penalty = "deduct mark" || "nullify", deductedMark = deduct mark.
    await Flag.updateMany(
      { examActivity: fetchedExamActivity._id },
      {
        isCleared: true,
        penalty: penalty,
        clearedBy: user_id,
        deductedMark: deductedMark,
      },
      {
        runValidators: true,
      }
    );

    await ExamActivity.findByIdAndUpdate(
      fetchedExamActivity._id,
      {
        isFlagged: true,
      },
      {
        runValidators: true,
      }
    );

    // reduce the number of flagged Results
    await Exam.findByIdAndUpdate(fetchedResult.exam, {
      $inc: {
        flaggedResultsCount: -1,
        flaggedCandidatesCount: -1,
        approvedResultsCount: 1,
      },
    });

    return res.status(200).json({
      type: "success",
      message: "Flags penalized successfully",
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

// Endpoint to penalized flagged attempt
exports.penalizeCandidateFlaggedAttempts = async (req, res) => {
  try {
    const candidateId = req.params.candidateId;
    const user_id = req.decoded.id;
    const { penalty } = req.body;
    const { deductedMark } = req.body;

    if (!penalty || penalty != "deduct mark") {
      return res.status(400).json({
        type: "failure",
        message: "BAD REQUEST!!!. Penalty is required or is invalid",
      });
    }

    fetchedExamActivity = await ExamActivity.findOne({
      candidate: candidateId,
    });

    if (!fetchedExamActivity.isFlagged) {
      return res.status(400).json({
        type: "failure",
        message: "Flags have already been cleared",
      });
    }

    if (!fetchedExamActivity.isMarked) {
      return res.status(400).json({
        type: "failure",
        message: "Please mark theory questions before attempting to clear flag",
      });
    }

    if (!deductedMark) {
      return res.status(400).json({
        type: "failure",
        message: "BAD REQUEST!!!. Deducted mark is required",
      });
    }

    const fetchedFlags = await Flag.find({
      candidate: candidateId,
      isCleared: false,
    });
    if (fetchedFlags.length < 1) {
      return res.status(404).json({
        type: "failure",
        message: "Candidate have no outstanding flag",
      });
    }

    // get candidate result from the exam activity
    const fetchedResult = await Result.findOne({ candidate: candidateId });
    if (!fetchedResult) {
      return res.status(400).json({
        type: "failure",
        message: "Not Successful!!!...Unable to fetch result",
      });
    }

    // check if result || examActivity is marked

    // deduct mark from result
    if (deductedMark > fetchedResult.score) {
      return res.status(400).json({
        type: "failure",
        message: "Deducted mark can't be greater than candidate score",
      });
    }
    let score = fetchedResult.score - deductedMark;
    let newDeductedMark = deductedMark + fetchedResult.deductedMark;

    let percentage = 0;

    if (score <= 0) {
      score = 0;
      percentage = 0;
    } else {
      percentage = 100 * (score / fetchedResult.totalExamScore);
      percentage = percentage.toFixed(0);
    }

    // update new result score
    await Result.findByIdAndUpdate(
      fetchedResult._id,
      {
        score: score,
        percentage: percentage,
        deductedMark: newDeductedMark,
        isCleared: true,
      },
      {
        runValidators: true,
      }
    );

    // update flags set isCleared =  true, clearedBy = userId, penalty = "deduct mark".
    await Flag.updateMany(
      { candidate: candidateId },
      {
        isCleared: true,
        penalty: penalty,
        clearedBy: user_id,
      },
      {
        runValidators: true,
      }
    );

    await ExamActivity.findByIdAndUpdate(
      fetchedExamActivity._id,
      {
        isFlagged: false,
      },
      {
        runValidators: true,
      }
    );

    // reduce the number of flagged Results
    await Exam.findByIdAndUpdate(
      fetchedResult.exam,
      {
        $inc: {
          flaggedResultsCount: -1,
          flaggedCandidatesCount: -1,
          approvedResultsCount: 1,
        },
      },
      {
        runValidators: true,
      }
    );

    await Candidate.findByIdAndUpdate(candidateId, {
      isCleared: true,
    });

    return res.status(200).json({
      type: "success",
      message: "Flags penalized successfully",
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

// Endpoints to Nullify
// cancel results = isCancelled: true, isCleared: false
// cancel candidate = isCancelled: true
// cancel examActivity = isCancelled: true
// cancel exam = isCancelled = true
// Endpoints to Nullify ExamActivity
module.exports.NullifyExamActivity = async (req, res) => {
  try {
    const examActivityId = req.params.examActivityId;

    await ExamActivity.findByIdAndUpdate(examActivityId, {
      isCancelled: true,
    });
    await Result.findOneAndUpdate(
      {
        examActivity: examActivityId,
      },
      { isCancelled: true, isCleared: false }
    );

    return res.status(200).json({
      type: "success",
      message: "ExamActivity nullified successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Server Error",
      err: err.message,
    });
  }
};

// Endpoints to Nullify Candidate
module.exports.NullifyCandidate = async (req, res) => {
  try {
    const candidateId = req.params.candidateId;

    await Candidate.findByIdAndUpdate(candidateId, {
      isCancelled: true,
    });
    await ExamActivity.updateMany(
      {
        candidate: candidateId,
      },
      { isCancelled: true }
    );
    await Result.updateMany(
      {
        candidate: candidateId,
      },
      { isCancelled: true, isCleared: false }
    );

    return res.status(200).json({
      type: "success",
      message: "Candidate nullified successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Server Error",
      err: err.message,
    });
  }
};

// // Endpoints to Nullify Candidates
// module.exports.NullifyCandidates = async (req, res) => {};

// // Endpoints to Nullify Exam
// module.exports.NullifyExam = async (req, res) => {};

const deleteExamFlags = async (examId) => {
  try {
    // delete candidates
    const deletedFlags = await Flag.deleteMany({ exam: examId });

    res.status(200).json({
      type: "success",
      data: deletedFlags,
      message: "Flags deleted successfully",
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

const deleteFlag = async (flagId) => {
  try {
    // delete candidates
    const deletedFlag = await Flag.findByIdAndDelete(flagId);

    res.status(200).json({
      type: "success",
      data: deletedFlag,
      message: "Flag deleted successfully",
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
