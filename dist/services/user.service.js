"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
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
exports.registerUser = registerUser;
exports.fetchUser = fetchUser;
exports.findNearbyUsers = findNearbyUsers;
const userModel = __importStar(require("../models/user.model"));
async function registerUser(userId, displayName, role) {
    // you could add extra business logic/validation here
    return userModel.createUser(userId, { displayName, role });
}
async function fetchUser(userId) {
    return userModel.getUser(userId);
}
async function findNearbyUsers(latitude, longitude, radiusInKm = 5, // Default 5km radius
limit = 10) {
    // Input validation
    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusInKm) || isNaN(limit)) {
        throw new Error("Invalid input parameters");
    }
    if (radiusInKm <= 0 || limit <= 0) {
        throw new Error("Radius and limit must be positive numbers");
    }
    return userModel.findNearbyUsers({ latitude, longitude }, radiusInKm, limit);
}
