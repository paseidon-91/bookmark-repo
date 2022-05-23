import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { IItem, Item } from '../item.model';
import { ItemService } from '../service/item.service';
import { ITag } from 'app/entities/tag/tag.model';
import { TagService } from 'app/entities/tag/service/tag.service';
import { ICategory } from 'app/entities/category/category.model';
import { CategoryService } from 'app/entities/category/service/category.service';
import { ItemType } from 'app/entities/enumerations/item-type.model';

@Component({
  selector: 'jhi-item-update',
  templateUrl: './item-update.component.html',
})
export class ItemUpdateComponent implements OnInit {
  isSaving = false;
  itemTypeValues = Object.keys(ItemType);

  tagsSharedCollection: ITag[] = [];
  categoriesSharedCollection: ICategory[] = [];

  editForm = this.fb.group({
    id: [],
    title: [],
    description: [],
    type: [],
    content: [],
    tags: [],
    category: [],
  });

  constructor(
    protected itemService: ItemService,
    protected tagService: TagService,
    protected categoryService: CategoryService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ item }) => {
      this.updateForm(item);

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const item = this.createFromForm();
    if (item.id !== undefined) {
      this.subscribeToSaveResponse(this.itemService.update(item));
    } else {
      this.subscribeToSaveResponse(this.itemService.create(item));
    }
  }

  trackTagById(_index: number, item: ITag): number {
    return item.id!;
  }

  trackCategoryById(_index: number, item: ICategory): number {
    return item.id!;
  }

  getSelectedTag(option: ITag, selectedVals?: ITag[]): ITag {
    if (selectedVals) {
      for (const selectedVal of selectedVals) {
        if (option.id === selectedVal.id) {
          return selectedVal;
        }
      }
    }
    return option;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IItem>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(item: IItem): void {
    this.editForm.patchValue({
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.type,
      content: item.content,
      tags: item.tags,
      category: item.category,
    });

    this.tagsSharedCollection = this.tagService.addTagToCollectionIfMissing(this.tagsSharedCollection, ...(item.tags ?? []));
    this.categoriesSharedCollection = this.categoryService.addCategoryToCollectionIfMissing(this.categoriesSharedCollection, item.category);
  }

  protected loadRelationshipsOptions(): void {
    this.tagService
      .query()
      .pipe(map((res: HttpResponse<ITag[]>) => res.body ?? []))
      .pipe(map((tags: ITag[]) => this.tagService.addTagToCollectionIfMissing(tags, ...(this.editForm.get('tags')!.value ?? []))))
      .subscribe((tags: ITag[]) => (this.tagsSharedCollection = tags));

    this.categoryService
      .query()
      .pipe(map((res: HttpResponse<ICategory[]>) => res.body ?? []))
      .pipe(
        map((categories: ICategory[]) =>
          this.categoryService.addCategoryToCollectionIfMissing(categories, this.editForm.get('category')!.value)
        )
      )
      .subscribe((categories: ICategory[]) => (this.categoriesSharedCollection = categories));
  }

  protected createFromForm(): IItem {
    return {
      ...new Item(),
      id: this.editForm.get(['id'])!.value,
      title: this.editForm.get(['title'])!.value,
      description: this.editForm.get(['description'])!.value,
      type: this.editForm.get(['type'])!.value,
      content: this.editForm.get(['content'])!.value,
      tags: this.editForm.get(['tags'])!.value,
      category: this.editForm.get(['category'])!.value,
    };
  }
}
