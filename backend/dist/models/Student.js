"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const StudentSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    branch: { type: String, required: true },
    college: { type: String, required: true },
    cgpa: { type: Number, required: true, min: 0, max: 10 },
    graduationYear: { type: Number, required: true },
    skills: [{ type: String }],
    preferredRoles: [{ type: String }],
    preferredLocations: [{ type: String }],
    experienceLevel: { type: String },
    resumeUrl: { type: String },
    bio: { type: String },
    githubUrl: { type: String },
    linkedinUrl: { type: String },
    portfolioUrl: { type: String },
}, {
    timestamps: true,
});
// Normalize skills on save
StudentSchema.pre('save', function () {
    if (this.skills) {
        this.skills = Array.from(new Set(this.skills.map((s) => s.toLowerCase().trim())));
    }
});
exports.default = mongoose_1.default.model('Student', StudentSchema);
