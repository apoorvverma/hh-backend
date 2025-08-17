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
exports.riderMatches = riderMatches;
exports.driverMatches = driverMatches;
const matchSvc = __importStar(require("../services/match.service"));
async function riderMatches(req, res) {
    console.log(`API Called: GET /api/matches/rider/${req.params.requestId}`);
    const { requestId } = req.params;
    const matches = await matchSvc.getDriverMatchesForRider(requestId);
    if (matches === null) {
        res.status(404).json({ error: "Request not found" });
        return;
    }
    res.json(matches);
}
async function driverMatches(req, res) {
    console.log(`API Called: GET /api/matches/driver/${req.params.rideId}`);
    const { rideId } = req.params;
    const matches = await matchSvc.getRiderMatchesForDriver(rideId);
    if (matches === null) {
        res.status(404).json({ error: "Ride not found" });
        return;
    }
    res.json(matches);
}
