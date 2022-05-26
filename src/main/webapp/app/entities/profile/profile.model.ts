import { ICategory } from 'app/entities/category/category.model';
import { IUser } from '../user/user.model';

export interface IProfile {
  id?: number;
  profileName?: string | null;
  user?: IUser | null;
  isDefault?: boolean | null;
  categories?: ICategory[] | null;
}

export class Profile implements IProfile {
  constructor(
    public id?: number,
    public profileName?: string | null,
    public user?: IUser | null,
    public isDefault?: boolean | null,
    public categories?: ICategory[] | null
  ) {
    this.isDefault = this.isDefault ?? false;
  }
}

export function getProfileIdentifier(profile: IProfile): number | undefined {
  return profile.id;
}
