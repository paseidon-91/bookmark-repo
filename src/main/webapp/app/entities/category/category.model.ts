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

export class CategoryLeaf implements ICategoryLeaf {
  constructor(public id?: number, public name?: string | null) {}
}

export class CategoryNode implements ICategoryNode {
  constructor(public id?: number, public name?: string | null, public children?: any) {}
}

export interface ICategoryLeaf {
  id?: number;
  name?: string | null;
}

export interface ICategoryNode {
  id?: number;
  name?: string | null;
  children?: any;
  profile?: IProfile | null;
}

export function getCategoryIdentifier(category: ICategory): number | undefined {
  return category.id;
}

export function categoryToNode(category: ICategory): ICategoryNode {
  return new CategoryNode(category.id, category.categoryName, []);
}
