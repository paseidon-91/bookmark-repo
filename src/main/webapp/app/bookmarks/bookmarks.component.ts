import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ICategory } from '../entities/category/category.model';
import { IProfile } from '../entities/profile/profile.model';

import { ASC, DESC, ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { CategoryService } from '../entities/category/service/category.service';
import { ParseLinks } from 'app/core/util/parse-links.service';
import { FormBuilder } from '@angular/forms';
import { IItem } from '../entities/item/item.model';
import { ProfileService } from '../entities/profile/service/profile.service';
import { ItemService } from '../entities/item/service/item.service';
import { ItemDeleteDialogComponent } from '../entities/item/delete/item-delete-dialog.component';
import { isPresent } from '../core/util/operators';

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

  @ViewChild('tree') tree: any;
  loadedParams = {
    textSearch: '',
    category: null,
  };

  constructor(
    protected categoryService: CategoryService,
    protected profileService: ProfileService,
    protected itemService: ItemService,
    protected modalService: NgbModal,
    protected parseLinks: ParseLinks,
    protected fb: FormBuilder
  ) {
    this.itemsPerPage = ITEMS_PER_PAGE;
    this.page = 0;
    this.links = {
      last: 0,
    };
    this.predicate = 'id';
    this.ascending = true;
    this.textSearch = '';
  }

  loadProfiles(): void {
    window.console.log('check - loadProfiles');
    this.isProfilesLoading = true;

    this.profileService
      .query({
        currentUserOnly: true,
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
            this.selectedProfile = null;
            this.selectedProfile = this.profilesSharedCollection.find(p => p.isDefault);
            this.loadCategories(this.selectedProfile);
          }
        },
        error: () => {
          this.isProfilesLoading = false;
        },
      });
  }

  loadCategories(profile: IProfile | null | undefined): void {
    window.console.log('check - loadCategories');
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
          if (this.categoriesSharedCollection.length > 0) {
            // this.selectedCategory.focusedNodeId = this.categoriesSharedCollection[0].id;
            this.tree.treeModel.focusedNodeId = this.categoriesSharedCollection[0].id;

            // this.items = [];
            // this.loadFilteredItems();
          }
        }
      },
      error: () => {
        this.isCategoriesLoading = false;
      },
    });
  }

  loadFilteredItems(): void {
    this.test();
    window.console.log('check - loadFilteredItems');
    this.loadedParams.category = this.selectedCategory.focusedNodeId;
    this.loadedParams.textSearch = this.textSearch;
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
          this.tree.treeModel.expandAll();
        },
        error: () => {
          this.isItemsLoading = false;
        },
      });
  }

  resetCategories(): void {
    window.console.log('check - resetCategories');
    this.page = 0;
    this.categoriesSharedCollection = [];
    // this.selectedCategory = {};
    this.loadCategories(this.selectedProfile);
  }

  resetProfiles(): void {
    window.console.log('check - resetProfiles');
    this.page = 0;
    this.profilesSharedCollection = [];
    this.selectedProfile = {};
    this.loadProfiles();
  }

  resetItems(): void {
    window.console.log('check - resetItems');
    this.page = 0;
    this.items = [];
    this.textSearch = '';
    this.loadFilteredItems();
  }

  loadPage(page: number): void {
    window.console.log('check - loadPage');
    this.page = page;
    this.loadFilteredItems();
  }

  ngOnInit(): void {
    window.console.log('check - init');
    this.loadProfiles();
  }

  trackProfileById(_index: number, item: IProfile): number {
    return item.id!;
  }

  trackId(_index: number, item: IItem): number {
    return item.id!;
  }

  refreshItems(): void {
    window.console.log('check - refresh items');
    this.items = [];
    this.loadFilteredItems();
  }

  onProfileChange(): void {
    window.console.log('check - profile changed');
    this.categoriesSharedCollection = [];
    this.loadCategories(this.selectedProfile);
  }

  // todo удалить, заменить на refreshItems()
  onCategoryChange(): void {
    if (this.loadedParams.category !== this.selectedCategory.focusedNodeId || this.loadedParams.textSearch !== this.textSearch) {
      window.console.log('check - category changed');
      this.items = [];
      this.loadFilteredItems();
    } else {
      window.console.log('check - category changed skip!!!!!');
    }
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
    window.console.log(`selectedCategory = `, this.selectedCategory.focusedNodeId);
    window.console.log(`selectedProfile = `, this.selectedProfile?.profileName);
    window.console.log(`textSearch = `, this.textSearch);
  }

  expandAll(): void {
    this.tree.treeModel.expandAll();
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
