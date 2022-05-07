import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ICategory } from '../entities/category/category.model';

import { ASC, DESC, ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { CategoryService } from '../entities/category/service/category.service';
import { CategoryDeleteDialogComponent } from '../entities/category/delete/category-delete-dialog.component';
import { ParseLinks } from 'app/core/util/parse-links.service';
// import {Account} from "../core/auth/account.model";
// import {Subject} from "rxjs";
// import {AccountService} from "../core/auth/account.service";
// import {Router} from "@angular/router";
// import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'jhi-category',
  templateUrl: './bookmarks.component.html',
})
export class BookmarksComponent implements OnInit {
  categories: ICategory[];
  isLoading = false;
  itemsPerPage: number;
  links: { [key: string]: number };
  page: number;
  predicate: string;
  ascending: boolean;

  constructor(protected categoryService: CategoryService, protected modalService: NgbModal, protected parseLinks: ParseLinks) {
    this.categories = [];
    this.itemsPerPage = ITEMS_PER_PAGE;
    this.page = 0;
    this.links = {
      last: 0,
    };
    this.predicate = 'id';
    this.ascending = true;
  }

  loadAll(): void {
    this.isLoading = true;

    this.categoryService
      .query({
        page: this.page,
        size: this.itemsPerPage,
        sort: this.sort(),
      })
      .subscribe({
        next: (res: HttpResponse<ICategory[]>) => {
          this.isLoading = false;
          this.paginateCategories(res.body, res.headers);
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  reset(): void {
    this.page = 0;
    this.categories = [];
    this.loadAll();
  }

  loadPage(page: number): void {
    this.page = page;
    this.loadAll();
  }

  ngOnInit(): void {
    this.loadAll();
  }

  trackId(_index: number, item: ICategory): number {
    return item.id!;
  }

  delete(category: ICategory): void {
    const modalRef = this.modalService.open(CategoryDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.category = category;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.reset();
      }
    });
  }

  protected sort(): string[] {
    const result = [this.predicate + ',' + (this.ascending ? ASC : DESC)];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  protected paginateCategories(data: ICategory[] | null, headers: HttpHeaders): void {
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
        this.categories.push(d);
      }
    }
  }
}

// export class BookmarksComponent implements OnInit, OnDestroy {
//   account: Account | null = null;
//
//   private readonly destroy$ = new Subject<void>();
//
//   constructor(private accountService: AccountService, private router: Router) {}
//
//   ngOnInit(): void {
//     this.accountService
//       .getAuthenticationState()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(account => (this.account = account));
//   }
//
//   login(): void {
//     this.router.navigate(['/login']);
//   }
//
//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }
// }
