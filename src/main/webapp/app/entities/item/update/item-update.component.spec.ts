import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { ItemService } from '../service/item.service';
import { IItem, Item } from '../item.model';
import { ITag } from 'app/entities/tag/tag.model';
import { TagService } from 'app/entities/tag/service/tag.service';
import { ICategory } from 'app/entities/category/category.model';
import { CategoryService } from 'app/entities/category/service/category.service';

import { ItemUpdateComponent } from './item-update.component';

describe('Item Management Update Component', () => {
  let comp: ItemUpdateComponent;
  let fixture: ComponentFixture<ItemUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let itemService: ItemService;
  let tagService: TagService;
  let categoryService: CategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [ItemUpdateComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(ItemUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ItemUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    itemService = TestBed.inject(ItemService);
    tagService = TestBed.inject(TagService);
    categoryService = TestBed.inject(CategoryService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Tag query and add missing value', () => {
      const item: IItem = { id: 456 };
      const tags: ITag[] = [{ id: 84506 }];
      item.tags = tags;

      const tagCollection: ITag[] = [{ id: 27884 }];
      jest.spyOn(tagService, 'query').mockReturnValue(of(new HttpResponse({ body: tagCollection })));
      const additionalTags = [...tags];
      const expectedCollection: ITag[] = [...additionalTags, ...tagCollection];
      jest.spyOn(tagService, 'addTagToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ item });
      comp.ngOnInit();

      expect(tagService.query).toHaveBeenCalled();
      expect(tagService.addTagToCollectionIfMissing).toHaveBeenCalledWith(tagCollection, ...additionalTags);
      expect(comp.tagsSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Category query and add missing value', () => {
      const item: IItem = { id: 456 };
      const category: ICategory = { id: 80346 };
      item.category = category;

      const categoryCollection: ICategory[] = [{ id: 36277 }];
      jest.spyOn(categoryService, 'query').mockReturnValue(of(new HttpResponse({ body: categoryCollection })));
      const additionalCategories = [category];
      const expectedCollection: ICategory[] = [...additionalCategories, ...categoryCollection];
      jest.spyOn(categoryService, 'addCategoryToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ item });
      comp.ngOnInit();

      expect(categoryService.query).toHaveBeenCalled();
      expect(categoryService.addCategoryToCollectionIfMissing).toHaveBeenCalledWith(categoryCollection, ...additionalCategories);
      expect(comp.categoriesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const item: IItem = { id: 456 };
      const tags: ITag = { id: 53961 };
      item.tags = [tags];
      const category: ICategory = { id: 54163 };
      item.category = category;

      activatedRoute.data = of({ item });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(item));
      expect(comp.tagsSharedCollection).toContain(tags);
      expect(comp.categoriesSharedCollection).toContain(category);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Item>>();
      const item = { id: 123 };
      jest.spyOn(itemService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ item });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: item }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(itemService.update).toHaveBeenCalledWith(item);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Item>>();
      const item = new Item();
      jest.spyOn(itemService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ item });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: item }));
      saveSubject.complete();

      // THEN
      expect(itemService.create).toHaveBeenCalledWith(item);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Item>>();
      const item = { id: 123 };
      jest.spyOn(itemService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ item });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(itemService.update).toHaveBeenCalledWith(item);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Tracking relationships identifiers', () => {
    describe('trackTagById', () => {
      it('Should return tracked Tag primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackTagById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });

    describe('trackCategoryById', () => {
      it('Should return tracked Category primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackCategoryById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });
  });

  describe('Getting selected relationships', () => {
    describe('getSelectedTag', () => {
      it('Should return option if no Tag is selected', () => {
        const option = { id: 123 };
        const result = comp.getSelectedTag(option);
        expect(result === option).toEqual(true);
      });

      it('Should return selected Tag for according option', () => {
        const option = { id: 123 };
        const selected = { id: 123 };
        const selected2 = { id: 456 };
        const result = comp.getSelectedTag(option, [selected2, selected]);
        expect(result === selected).toEqual(true);
        expect(result === selected2).toEqual(false);
        expect(result === option).toEqual(false);
      });

      it('Should return option if this Tag is not selected', () => {
        const option = { id: 123 };
        const selected = { id: 456 };
        const result = comp.getSelectedTag(option, [selected]);
        expect(result === option).toEqual(true);
        expect(result === selected).toEqual(false);
      });
    });
  });
});
