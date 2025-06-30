"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceController = void 0;
const deviceTokenSchema_1 = require("../schemas/deviceTokenSchema");
const deviceServices_1 = require("../services/deviceServices");
const deviceServicesController = new deviceServices_1.DeviceServices();
class DeviceController {
    updateDevice(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
                const data = deviceTokenSchema_1.deviceSchema.parse(req.body);
                const user = yield deviceServicesController.updateDeviceToken(id, data);
                res.status(200).json(user);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
}
exports.DeviceController = DeviceController;
