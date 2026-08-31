"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const studentRoutes_1 = __importDefault(require("./routes/studentRoutes"));
const opportunityRoutes_1 = __importDefault(require("./routes/opportunityRoutes"));
const applicationRoutes_1 = __importDefault(require("./routes/applicationRoutes"));
const recommendationRoutes_1 = __importDefault(require("./routes/recommendationRoutes"));
const assistantRoutes_1 = __importDefault(require("./routes/assistantRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/students', studentRoutes_1.default);
app.use('/api/opportunities', opportunityRoutes_1.default);
app.use('/api/applications', applicationRoutes_1.default);
app.use('/api/recommendations', recommendationRoutes_1.default);
app.use('/api/assistant', assistantRoutes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// Error handling middleware
app.use(errorHandler_1.errorHandler);
exports.default = app;
