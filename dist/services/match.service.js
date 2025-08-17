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
exports.getDriverMatchesForRider = getDriverMatchesForRider;
exports.getRiderMatchesForDriver = getRiderMatchesForDriver;
// src/services/match.service.ts
const rideModel = __importStar(require("../models/ride.model"));
const reqModel = __importStar(require("../models/request.model"));
const ride_service_1 = require("./ride.service");
const request_service_1 = require("./request.service");
const DEFAULT_RADIUS = 5000;
async function getDriverMatchesForRider(requestId, radius = DEFAULT_RADIUS) {
    const req = await reqModel.getRequestById(requestId);
    if (!req)
        return null;
    // find driver rides near rider’s origin
    return (0, ride_service_1.findRidesNearby)(req.origin.lat, req.origin.lng, radius);
}
async function getRiderMatchesForDriver(rideId, radius = DEFAULT_RADIUS) {
    const ride = await rideModel.getRideById(rideId);
    if (!ride)
        return null;
    // find ride requests near driver’s origin
    return (0, request_service_1.findRequestsNearby)(ride.origin.lat, ride.origin.lng, radius);
}
