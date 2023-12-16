const express = require("express");

const {
  createPlan,
  updatePlan,
  getPlans,
  getPlan,
  deletePlan,
  updatePlanTitle,
} = require("../controllers/plan.controller");

const router = express.Router();

router.route("/").post(createPlan);

router.route("/").get(getPlans);

router.route("/:planId").get(getPlan);

router.route("/:planId").delete(deletePlan);

router.route("/:planId").put(updatePlan);

router.route("/:planId/title").put(updatePlanTitle);

module.exports = router;
