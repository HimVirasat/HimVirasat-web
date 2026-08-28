import { UsersRepository, usersRepository } from "../users.repository.js";
import { isUuid } from "../../../utils/id.js";

export class UserDialectsService {
  constructor(
    private readonly repository: UsersRepository = usersRepository,
  ) {}

  async getDialects(identifier: string): Promise<string[] | null> {
    if (isUuid(identifier)) {
      return this.repository.findDialectsByUserId(identifier);
    }
    return this.repository.findDialectsByUsername(identifier);
  }
}

export const userDialectsService = new UserDialectsService();
