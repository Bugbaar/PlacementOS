"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const assistantController_1 = require("../controllers/assistantController");
const validate_1 = require("../middleware/validate");
const assistantValidator_1 = require("../validators/assistantValidator");
const router = express_1.default.Router();
// Rate limiting: 10 requests per minute for the chat endpoint
const chatLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many messages sent. Please wait a minute before trying again.'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});
router.post('/chat', chatLimiter, (0, validate_1.validate)(assistantValidator_1.chatRequestSchema), assistantController_1.chat);
router.get('/insights/:studentId', assistantController_1.getInsights);
exports.default = router;
