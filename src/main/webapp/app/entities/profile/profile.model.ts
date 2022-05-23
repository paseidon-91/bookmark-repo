import { ICategory } from 'app/entities/category/category.model';

export interface IProfile {
  id?: number;
  profileName?: string | null;
  userId?: number | null;
  isDefault?: boolean | null;
  categories?: ICategory[] | null;
}

export class Profile implements IProfile {
  constructor(
    public id?: number,
    public profileName?: string | null,
    public userId?: number | null,
    public isDefault?: boolean | null,
    public categories?: ICategory[] | null
  ) {
    this.isDefault = this.isDefault ?? false;
  }
}

export function getProfileIdentifier(profile: IProfile): number | undefined {
  return profile.id;
}
