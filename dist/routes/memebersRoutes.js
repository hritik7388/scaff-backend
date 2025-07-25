"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const memberController_1 = require("../controllers/memberController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const addMemberController = new memberController_1.AddMemberController();
/**
 * @route   POST /api/v1/member/addMember
 * @desc    Add a new member
 * @access  Private (Company)
 */
router.post("/addMember", authMiddleware_1.authMiddleware, addMemberController.addNewMember.bind(addMemberController));
exports.default = router;
