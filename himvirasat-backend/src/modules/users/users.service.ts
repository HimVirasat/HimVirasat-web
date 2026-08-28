import {
  LanguageExpertsService,
  languageExpertsService,
} from "./language-experts/language-experts.service.js";
import {
  LanguageHeadsService,
  languageHeadsService,
} from "./language-heads/language-heads.service.js";
import {
  UserDialectsService,
  userDialectsService,
} from "./user-dialects/user-dialects.service.js";

/**
 * Facade service that delegates to the split sub-module services.
 * Kept for backward compatibility with the module barrel exports.
 */
export class UsersService {
  fetchLanguageExperts: LanguageExpertsService["fetch"];
  createLanguageExpert: LanguageExpertsService["create"];
  deleteLanguageExpert: LanguageExpertsService["delete"];
  updateExpertDialects: LanguageExpertsService["updateDialects"];
  fetchLanguageHeads: LanguageHeadsService["fetch"];
  createLanguageHead: LanguageHeadsService["create"];
  deleteLanguageHead: LanguageHeadsService["delete"];
  updateHeadDialects: LanguageHeadsService["updateDialects"];
  getUserDialectsById: UserDialectsService["getDialects"];
  getUserDialectsByUsername: UserDialectsService["getDialects"];

  constructor(
    experts: LanguageExpertsService = languageExpertsService,
    heads: LanguageHeadsService = languageHeadsService,
    dialects: UserDialectsService = userDialectsService,
  ) {
    this.fetchLanguageExperts = experts.fetch.bind(experts);
    this.createLanguageExpert = experts.create.bind(experts);
    this.deleteLanguageExpert = experts.delete.bind(experts);
    this.updateExpertDialects = experts.updateDialects.bind(experts);
    this.fetchLanguageHeads = heads.fetch.bind(heads);
    this.createLanguageHead = heads.create.bind(heads);
    this.deleteLanguageHead = heads.delete.bind(heads);
    this.updateHeadDialects = heads.updateDialects.bind(heads);
    this.getUserDialectsById = dialects.getDialects.bind(dialects);
    this.getUserDialectsByUsername = dialects.getDialects.bind(dialects);
  }
}

export const usersService = new UsersService();
