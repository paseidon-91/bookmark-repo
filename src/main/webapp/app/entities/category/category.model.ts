import { IItem } from 'app/entities/item/item.model';
import { IProfile } from 'app/entities/profile/profile.model';

export interface ICategory {
  id?: number;
  categoryName?: string | null;
  items?: IItem[] | null;
  parent?: ICategory | null;
  profile?: IProfile | null;
}

export class Category implements ICategory {
  constructor(
    public id?: number,
    public categoryName?: string | null,
    public items?: IItem[] | null,
    public parent?: ICategory | null,
    public profile?: IProfile | null
  ) {}
}

export function getCategoryIdentifier(category: ICategory): number | undefined {
  return category.id;
}
