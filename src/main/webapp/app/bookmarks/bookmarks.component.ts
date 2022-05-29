import { Component, OnInit } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ICategory } from '../entities/category/category.model';
import { IProfile } from '../entities/profile/profile.model';

import { ASC, DESC, ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { CategoryService, EntityArrayResponseType } from '../entities/category/service/category.service';
import { ParseLinks } from 'app/core/util/parse-links.service';
import { FormBuilder } from '@angular/forms';
import { IItem } from '../entities/item/item.model';
import { ProfileService } from '../entities/profile/service/profile.service';
import { ItemService } from '../entities/item/service/item.service';
import { ItemDeleteDialogComponent } from '../entities/item/delete/item-delete-dialog.component';
import { isPresent } from '../core/util/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'jhi-bookmark',
  templateUrl: './bookmarks.component.html',
})
export class BookmarksComponent implements OnInit {
  // categories: ICategory[];
  selectedCategory: any = {};
  selectedProfile: IProfile | null | undefined = {};
  textSearch: string;
  profilesSharedCollection: IProfile[] = [];
  categoriesSharedCollection: any[] = [];
  items: IItem[] = [];
  isProfilesLoading = false;
  isCategoriesLoading = false;
  isItemsLoading = false;
  itemsPerPage: number;
  links: { [key: string]: number };
  page: number;
  predicate: string;
  ascending: boolean;

  constructor(
    protected categoryService: CategoryService,
    protected profileService: ProfileService,
    protected itemService: ItemService,
    protected modalService: NgbModal,
    protected parseLinks: ParseLinks,
    protected fb: FormBuilder
  ) {
    this.categoriesSharedCollection = [];
    this.itemsPerPage = ITEMS_PER_PAGE;
    this.page = 0;
    this.links = {
      last: 0,
    };
    this.predicate = 'id';
    this.ascending = true;
    this.textSearch = '';
  }

  loadCategories(profile: IProfile | null | undefined): void {
    this.isCategoriesLoading = true;
    let body;
    if (profile?.id) {
      body = {
        page: 0,
        size: 99999,
        sort: ['categoryName,asc', 'id,asc'],
        profile: profile.id,
      };
    } else {
      body = {
        page: 0,
        size: 99999,
        sort: ['categoryName,asc', 'id,asc'],
      };
    }

    this.categoryService.query(body).subscribe({
      next: (res: HttpResponse<ICategory[]>) => {
        this.isCategoriesLoading = false;
        if (res.body) {
          for (const d of res.body) {
            this.categoriesSharedCollection.push(d);
          }
          this.categoriesSharedCollection = this.categoryService.convertAll(
            this.categoryService.parseCategoryToTree(this.categoriesSharedCollection)
          );
          this.selectedCategory.activeNodeIds = this.categoriesSharedCollection[0].id;
          this.loadFilteredItems();
          this.test();
        }
      },
      error: () => {
        this.isCategoriesLoading = false;
      },
    });
  }

  loadProfiles(): void {
    this.isProfilesLoading = true;

    this.profileService
      .query({
        page: 0,
        size: 99999,
        sort: ['profileName,asc', 'id,asc'],
      })
      .subscribe({
        next: (res: HttpResponse<IProfile[]>) => {
          this.isProfilesLoading = false;
          if (res.body) {
            for (const d of res.body) {
              this.profilesSharedCollection.push(d);
            }
            this.selectedProfile = this.profilesSharedCollection.find(p => p.isDefault);
            this.loadCategories(this.selectedProfile);
          }
        },
        error: () => {
          this.isProfilesLoading = false;
        },
      });
  }

  loadItems(category: any): void {
    this.isItemsLoading = true;
    let body;
    if (category?.focusedNodeId) {
      body = {
        page: 0,
        size: 99999,
        sort: ['categoryName,asc', 'id,asc'],
        category: category.focusedNodeId,
      };
    } else {
      body = {
        page: 0,
        size: 99999,
        sort: ['categoryName,asc', 'id,asc'],
      };
    }

    this.itemService
      .query({
        page: this.page,
        size: this.itemsPerPage,
        // sort: this.sort('title'),
        sort: this.sort(),
      })
      .subscribe({
        next: (res: HttpResponse<IItem[]>) => {
          this.isItemsLoading = false;
          this.paginateItems(res.body, res.headers);
        },
        error: () => {
          this.isItemsLoading = false;
        },
      });
  }

  loadFilteredItems(): void {
    this.isItemsLoading = true;

    this.itemService
      .queryFiltered({
        searchText: this.textSearch ? this.textSearch : '',
        category: isPresent(this.selectedCategory)
          ? isPresent(this.selectedCategory.focusedNodeId)
            ? this.selectedCategory.focusedNodeId
            : ''
          : '',
        page: this.page,
        size: this.itemsPerPage,
        // sort: this.sort('title'),
        sort: this.sort(),
      })
      .subscribe({
        next: (res: HttpResponse<IItem[]>) => {
          this.isItemsLoading = false;
          this.paginateItems(res.body, res.headers);
        },
        error: () => {
          this.isItemsLoading = false;
        },
      });
  }

  resetCategories(): void {
    this.page = 0;
    this.categoriesSharedCollection = [];
    this.selectedCategory = {};
    this.loadCategories(this.selectedProfile);
  }

  resetProfiles(): void {
    this.page = 0;
    this.profilesSharedCollection = [];
    this.selectedProfile = {};
    this.loadProfiles();
  }

  resetItems(): void {
    this.page = 0;
    this.items = [];
    this.textSearch = '';
    this.loadFilteredItems();
  }

  loadPage(page: number): void {
    this.page = page;
    this.loadFilteredItems();
  }

  ngOnInit(): void {
    this.loadProfiles();
    // this.loadCategories(this.selectedProfile);
    // this.loadItems(this.selectedCategory);
  }

  trackProfileById(_index: number, item: IProfile): number {
    return item.id!;
  }

  trackId(_index: number, item: IItem): number {
    return item.id!;
  }

  refreshItems(): void {
    this.test();
    this.items = [];
    this.loadFilteredItems();
  }

  delete(item: IItem): void {
    const modalRef = this.modalService.open(ItemDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.item = item;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.resetItems();
      }
    });
  }

  test(): void {
    window.console.log('test check');
    window.console.log(this.selectedCategory);
    window.console.log(this.selectedProfile);
    window.console.log(this.textSearch);
  }

  getCategoryQueryParams(): any {
    if (this.selectedProfile?.id && this.selectedCategory?.focusedNodeId) {
      return {
        profile: this.selectedProfile.id.toString(),
        parentId: this.selectedCategory?.focusedNodeId.toString(),
      };
    } else if (this.selectedProfile?.id) {
      return {
        profile: this.selectedProfile.id.toString(),
      };
    } else if (this.selectedCategory?.focusedNodeId) {
      return {
        parentId: this.selectedCategory?.focusedNodeId.toString(),
      };
    } else {
      return {};
    }
  }

  getItemQueryParams(): any {
    if (this.selectedCategory?.focusedNodeId) {
      return {
        category: this.selectedCategory?.focusedNodeId.toString(),
      };
    } else {
      return {};
    }
  }

  protected sort(): string[] {
    const result = [this.predicate + ',' + (this.ascending ? ASC : DESC)];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    window.console.log(result);
    return result;
  }

  protected paginateItems(data: IItem[] | null, headers: HttpHeaders): void {
    const linkHeader = headers.get('link');
    if (linkHeader) {
      this.links = this.parseLinks.parse(linkHeader);
    } else {
      this.links = {
        last: 0,
      };
    }
    if (data) {
      for (const d of data) {
        this.items.push(d);
      }
    }
  }
}
