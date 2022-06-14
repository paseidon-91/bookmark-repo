import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { Category, ICategory } from '../category.model';
import { CategoryService } from '../service/category.service';
import { Profile } from '../../profile/profile.model';
import { ProfileService } from '../../profile/service/profile.service';

@Injectable({ providedIn: 'root' })
export class CategoryRoutingResolveService implements Resolve<ICategory> {
  constructor(
    protected service: CategoryService,
    protected categoryService: CategoryService,
    protected profileService: ProfileService,
    protected router: Router
  ) {}

  addProfileToCategory(category: Category, route: ActivatedRouteSnapshot): Observable<Category> {
    return this.profileService.find(route.queryParams['profile']).pipe(
      mergeMap((profile: HttpResponse<Profile>) => {
        if (profile.body) {
          category.profile = profile.body;
          return of(category);
        } else {
          //todo как-то иначе обработать этот кейс
          this.router.navigate(['404']);
          return EMPTY;
        }
      })
    );
  }

  addParentToCategory(category: Category, route: ActivatedRouteSnapshot): Observable<Category> {
    return this.categoryService.find(route.queryParams['parentId']).pipe(
      mergeMap((parent: HttpResponse<Category>) => {
        if (parent.body) {
          category.parent = parent.body;
          if (route.queryParams['profile']) {
            return this.addProfileToCategory(category, route);
          } else {
            return of(category);
          }
        } else {
          //todo как-то иначе обработать этот кейс
          this.router.navigate(['404']);
          return EMPTY;
        }
      })
    );
  }

  resolve(route: ActivatedRouteSnapshot): Observable<ICategory> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((category: HttpResponse<Category>) => {
          if (category.body) {
            return of(category.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    } else {
      const categoryId = route.queryParams['parentId'];
      const profileId = route.queryParams['profile'];
      const resultCategory: Category = new Category();

      if (categoryId) {
        return this.addParentToCategory(resultCategory, route);
      } else if (profileId) {
        return this.addProfileToCategory(resultCategory, route);
      }

      return of(resultCategory);
    }
    return of(new Category());
  }
}
