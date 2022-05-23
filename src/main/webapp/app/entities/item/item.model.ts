import { ITag } from 'app/entities/tag/tag.model';
import { ICategory } from 'app/entities/category/category.model';
import { ItemType } from 'app/entities/enumerations/item-type.model';

export interface IItem {
  id?: number;
  title?: string | null;
  description?: string | null;
  type?: ItemType | null;
  content?: string | null;
  tags?: ITag[] | null;
  category?: ICategory | null;
}

export class Item implements IItem {
  constructor(
    public id?: number,
    public title?: string | null,
    public description?: string | null,
    public type?: ItemType | null,
    public content?: string | null,
    public tags?: ITag[] | null,
    public category?: ICategory | null
  ) {}
}

export function getItemIdentifier(item: IItem): number | undefined {
  return item.id;
}
