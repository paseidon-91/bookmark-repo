import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IItem, Item } from '../item.model';
import { ItemService } from '../service/item.service';
import { Category } from '../../category/category.model';
import { CategoryService } from '../../category/service/category.service';

@Injectable({ providedIn: 'root' })
export class ItemRoutingResolveService implements Resolve<IItem> {
  constructor(protected service: ItemService, protected categoryService: CategoryService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IItem> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((item: HttpResponse<Item>) => {
          if (item.body) {
            return of(item.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    } else {
      const categoryId = route.queryParams['category'];
      const resultItem: Item = new Item();
      if (categoryId) {
        return this.categoryService.find(categoryId).pipe(
          mergeMap((category: HttpResponse<Category>) => {
            if (category.body) {
              resultItem.category = category.body;
              return of(resultItem);
            } else {
              //todo как-то иначе обработать этот кейс
              this.router.navigate(['404']);
              return EMPTY;
            }
          })
        );
      }
      return of(resultItem);
    }
    return of(new Item());
  }
}
