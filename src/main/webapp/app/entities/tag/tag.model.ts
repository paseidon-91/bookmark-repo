import { IItem } from 'app/entities/item/item.model';

export interface ITag {
  id?: number;
  tag?: string | null;
  tags?: IItem[] | null;
}

export class Tag implements ITag {
  constructor(public id?: number, public tag?: string | null, public tags?: IItem[] | null) {}
}

export function getTagIdentifier(tag: ITag): number | undefined {
  return tag.id;
}
