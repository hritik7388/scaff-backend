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
exports.AddMemberController = void 0;
const addMemeberServices_1 = require("../services/addMemeberServices");
const addMemberSchema_1 = require("../schemas/addMemberSchema");
const memeberData = new addMemeberServices_1.AddMemberServices();
class AddMemberController {
    addNewMember(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
                const data = addMemberSchema_1.addMemberSchema.parse(req.body);
                const member = yield memeberData.addNewMemberServices(id, data);
                res.status(201).json(member);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
}
exports.AddMemberController = AddMemberController;
