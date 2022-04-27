import { IItem } from 'app/entities/item/item.model';

export interface ICategory {
  id?: number;
  categoryName?: string | null;
  items?: IItem[] | null;
  parent?: ICategory | null;
}

export class Category implements ICategory {
  constructor(public id?: number, public categoryName?: string | null, public items?: IItem[] | null, public parent?: ICategory | null) {}
}

export function getCategoryIdentifier(category: ICategory): number | undefined {
  return category.id;
}
