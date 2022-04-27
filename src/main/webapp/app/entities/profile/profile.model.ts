import { IItem } from 'app/entities/item/item.model';

export interface IProfile {
  id?: number;
  profileName?: string | null;
  userId?: number | null;
  isDefault?: boolean | null;
  items?: IItem[] | null;
}

export class Profile implements IProfile {
  constructor(
    public id?: number,
    public profileName?: string | null,
    public userId?: number | null,
    public isDefault?: boolean | null,
    public items?: IItem[] | null
  ) {
    this.isDefault = this.isDefault ?? false;
  }
}

export function getProfileIdentifier(profile: IProfile): number | undefined {
  return profile.id;
}
