import {
  LanguageExpertsController,
  languageExpertsController,
} from "./language-experts/language-experts.controller.js";
import {
  LanguageHeadsController,
  languageHeadsController,
} from "./language-heads/language-heads.controller.js";
import {
  UserDialectsController,
  userDialectsController,
} from "./user-dialects/user-dialects.controller.js";

/**
 * Facade controller that delegates to the split sub-module controllers.
 * Kept for backward compatibility with the module barrel exports.
 */
export class UsersController {
  getLanguageExperts: LanguageExpertsController["getLanguageExperts"];
  createLanguageExpert: LanguageExpertsController["createLanguageExpert"];
  deleteLanguageExpert: LanguageExpertsController["deleteLanguageExpert"];
  updateExpertDialects: LanguageExpertsController["updateExpertDialects"];
  getLanguageHeads: LanguageHeadsController["getLanguageHeads"];
  createLanguageHead: LanguageHeadsController["createLanguageHead"];
  deleteLanguageHead: LanguageHeadsController["deleteLanguageHead"];
  updateHeadDialects: LanguageHeadsController["updateHeadDialects"];
  getUserDialects: UserDialectsController["getUserDialects"];

  constructor(
    experts: LanguageExpertsController = languageExpertsController,
    heads: LanguageHeadsController = languageHeadsController,
    dialects: UserDialectsController = userDialectsController,
  ) {
    this.getLanguageExperts = experts.getLanguageExperts;
    this.createLanguageExpert = experts.createLanguageExpert;
    this.deleteLanguageExpert = experts.deleteLanguageExpert;
    this.updateExpertDialects = experts.updateExpertDialects;
    this.getLanguageHeads = heads.getLanguageHeads;
    this.createLanguageHead = heads.createLanguageHead;
    this.deleteLanguageHead = heads.deleteLanguageHead;
    this.updateHeadDialects = heads.updateHeadDialects;
    this.getUserDialects = dialects.getUserDialects;
  }
}

export const usersController = new UsersController();
