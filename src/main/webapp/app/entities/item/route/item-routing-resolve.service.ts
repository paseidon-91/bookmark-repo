import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IItem, Item } from '../item.model';
import { ItemService } from '../service/item.service';
import { Category } from '../../category/category.model';
import { CategoryService, EntityResponseType } from '../../category/service/category.service';
import { ProfileService } from '../../profile/service/profile.service';
import { Profile } from '../../profile/profile.model';

@Injectable({ providedIn: 'root' })
export class ItemRoutingResolveService implements Resolve<IItem> {
  constructor(
    protected service: ItemService,
    protected categoryService: CategoryService,
    protected profileService: ProfileService,
    protected router: Router
  ) {}

  addProfileToItem(item: Item, route: ActivatedRouteSnapshot): Observable<Item> {
    return this.profileService.find(route.queryParams['profile']).pipe(
      mergeMap((profile: HttpResponse<Profile>) => {
        if (profile.body) {
          item.profile = profile.body;
          return of(item);
        } else {
          //todo как-то иначе обработать бы этот кейс
          this.router.navigate(['404']);
          return EMPTY;
        }
      })
    );
  }

  addCategoryToItem(item: Item, route: ActivatedRouteSnapshot): Observable<Item> {
    return this.categoryService.find(route.queryParams['category']).pipe(
      mergeMap((category: HttpResponse<Category>) => {
        if (category.body) {
          item.categoru = category.body;
          if (route.queryParams['profile']) {
            return this.addProfileToItem(item, route);
          } else {
            return of(item);
          }
        } else {
          //todo как-то иначе обработать бы этот кейс
          this.router.navigate(['404']);
          return EMPTY;
        }
      })
    );
  }

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
      const profileId = route.queryParams['profile'];
      const resultItem: Item = new Item();

      if (categoryId) {
        return this.addCategoryToItem(resultItem, route);
      } else if (profileId) {
        return this.addProfileToItem(resultItem, route);
      }

      return of(resultItem);
    }
    return of(new Item());
  }
}
