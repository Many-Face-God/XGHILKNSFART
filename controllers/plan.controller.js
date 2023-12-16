const Plan = require("../models/plan");
module.exports.createPlan = async (req, res) => {
  try {
    const {
      title,
      price,
      description,
      facialAuthentication,
      voiceDetection,
      soundRecording,
      inExamFacialSnapshot,
      trackHeadMovement,
      trackEyeMovement,
      forceFullScreen,
      multiFaceDetection,
    } = req.body;

    const isExist = await Plan.exists({ title: title });
    if (isExist) {
      return res.status(400).json({
        success: false,
        message: "The operation failed",
        error: `Title: ${title} already exists`,
      });
    }

    const newPlan = await Plan.create({
      title,
      price,
      description,
      facialAuthentication,
      voiceDetection,
      soundRecording,
      inExamFacialSnapshot,
      trackHeadMovement,
      trackEyeMovement,
      forceFullScreen,
      multiFaceDetection,
    });

    return res.status(201).json({
      info: {
        success: true,
        message: "The operation was successful",
      },
      data: {
        plan: newPlan,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      info: {
        success: false,
        message: "The operation failed",
        error: err.message,
      },
    });
  }
};

module.exports.updatePlan = async (req, res) => {
  try {
    const planId = req.params.planId;
    const {
      price,
      description,
      facialAuthentication,
      voiceDetection,
      soundRecording,
      inExamFacialSnapshot,
      trackHeadMovement,
      trackEyeMovement,
      forceFullScreen,
      multiFaceDetection,
    } = req.body;

    const updatedPlan = await Plan.findByIdAndUpdate(
      planId,
      {
        price,
        description,
        facialAuthentication,
        voiceDetection,
        soundRecording,
        inExamFacialSnapshot,
        trackHeadMovement,
        trackEyeMovement,
        forceFullScreen,
        multiFaceDetection,
      },
      {
        new: true,
      }
    );

    return res.status(201).json({
      info: {
        success: true,
        message: "The operation was successful",
      },
      data: {
        plan: updatedPlan,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      info: {
        success: false,
        message: "The operation failed",
        error: err.message,
      },
    });
  }
};

module.exports.updatePlanTitle = async (req, res) => {
  try {
    const planId = req.params.planId;
    const { title } = req.body;

    const isExist = await Plan.exists({ title: title });
    if (isExist) {
      return res.status(400).json({
        success: false,
        message: "The operation failed",
        error: `Title: ${title} already exists`,
      });
    }

    const updatedPlan = await Plan.findByIdAndUpdate(
      planId,
      {
        title,
      },
      {
        new: true,
      }
    );

    return res.status(201).json({
      info: {
        success: true,
        message: "The operation was successful",
      },
      data: {
        plan: updatedPlan,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      info: {
        success: false,
        message: "The operation failed",
        error: err.message,
      },
    });
  }
};

module.exports.deletePlan = async (req, res) => {
  try {
    const planId = req.params.planId;

    const deletedPlan = await Plan.findByIdAndUpdate(
      planId,
      {
        isDeleted: true,
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      info: {
        success: true,
        message: "The operation was successful",
      },
      data: {
        deletedPlan: deletedPlan,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      info: {
        success: false,
        message: "The operation failed",
        error: err.message,
      },
    });
  }
};

module.exports.getPlans = async (req, res) => {
  try {
    const fetchedPlans = await Plan.find({ isDeleted: false });

    if (fetchedPlans.length < 1) {
      return res.status(404).json({
        info: {
          success: false,
          message: "The operation failed",
          error: "Plan list is empty",
        },
      });
    }

    return res.status(200).json({
      info: {
        success: true,
        message: "The operation was successful",
      },
      data: {
        plans: fetchedPlans,
      },
    });
  } catch (err) {
    console.log(err).json({
      info: {
        success: false,
        message: "The operation failed",
        error: err.message,
      },
    });
  }
};

module.exports.getPlan = async (req, res) => {
  const title = req.body.title;
  if (!title) {
    return res.status(404).json({
      info: {
        success: false,
        message: "The operation failed",
        error: "Title is required",
      },
    });
  }
  const fetchedPlan = await Plan.find({ isDeleted: false });
  if (!fetchedPlan) {
    return res.status(404).json({
      info: {
        success: false,
        message: "The operation failed",
        error: "Plan not found",
      },
    });
  }

  return res.status(200).json({
    info: {
      success: true,
      message: "The operation was successful",
    },
    data: {
      plan: fetchedPlan,
    },
  });
};

module.exports.fetchedPlan = async () => {
  try {
    const fetchedPlan = await Plan.find().select([
      "-createdAt",
      "-_id",
      "-updatedAt",
    ]);
    if (!fetchedPlan || fetchedPlan.length <= 0) {
      return "Plan list is empty.";
    }
    return fetchedPlan;
  } catch (err) {
    return "Error occurred while fetching plans.";
  }
};
