import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ICategory, getCategoryIdentifier, ICategoryNode, categoryToNode, ICategoryLeaf, CategoryLeaf } from '../category.model';

export type EntityResponseType = HttpResponse<ICategory>;
export type EntityArrayResponseType = HttpResponse<ICategory[]>;

@Injectable({ providedIn: 'root' })
export class CategoryService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/categories');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(category: ICategory): Observable<EntityResponseType> {
    return this.http.post<ICategory>(this.resourceUrl, category, { observe: 'response' });
  }

  update(category: ICategory): Observable<EntityResponseType> {
    return this.http.put<ICategory>(`${this.resourceUrl}/${getCategoryIdentifier(category) as number}`, category, { observe: 'response' });
  }

  partialUpdate(category: ICategory): Observable<EntityResponseType> {
    return this.http.patch<ICategory>(`${this.resourceUrl}/${getCategoryIdentifier(category) as number}`, category, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ICategory>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ICategory[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addCategoryToCollectionIfMissing(categoryCollection: ICategory[], ...categoriesToCheck: (ICategory | null | undefined)[]): ICategory[] {
    const categories: ICategory[] = categoriesToCheck.filter(isPresent);
    if (categories.length > 0) {
      const categoryCollectionIdentifiers = categoryCollection.map(categoryItem => getCategoryIdentifier(categoryItem)!);
      const categoriesToAdd = categories.filter(categoryItem => {
        const categoryIdentifier = getCategoryIdentifier(categoryItem);
        if (categoryIdentifier == null || categoryCollectionIdentifiers.includes(categoryIdentifier)) {
          return false;
        }
        categoryCollectionIdentifiers.push(categoryIdentifier);
        return true;
      });
      return [...categoriesToAdd, ...categoryCollection];
    }
    return categoryCollection;
  }

  parseCategoryToTree(categoryCollection: ICategory[]): ICategoryNode[] {
    const result: ICategoryNode[] = [];

    if (categoryCollection.length > 0) {
      const sortedCategories = this.getSortedArr(categoryCollection);
      sortedCategories.forEach(cat => {
        const node: ICategoryNode | null | undefined = this.findInChildren(cat, result);
        if (!isPresent(node)) {
          result.push(categoryToNode(cat));
        } else {
          node.children?.push(categoryToNode(cat));
        }
      });
      this.deepSort(result);
      return result;
    }
    return [];
  }

  convertAll(nodes: ICategoryNode[]): any[] {
    function nodeToLeaf(node: ICategoryNode): ICategoryLeaf {
      return new CategoryLeaf(node.id, node.name);
    }

    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].children?.length > 0) {
        nodes[i].children = this.convertAll(nodes[i].children);
      } else {
        nodes[i] = nodeToLeaf(nodes[i]);
      }
    }
    return nodes;
  }

  // Упорядочит коллекцию перед слиянием в кошерное дерево
  protected getSortedArr(categoryCollection: ICategory[]): ICategory[] {
    const result: ICategory[] = [];
    for (let i = categoryCollection.length - 1; i >= 0; i--) {
      if (!isPresent(categoryCollection[i].parent)) {
        result.push(categoryCollection[i]);
        categoryCollection.splice(i, 1);
      }
    }
    let diff = result.length;
    while (categoryCollection.length > 0) {
      for (let i = categoryCollection.length - 1; i >= 0; i--) {
        if (result.map(item => getCategoryIdentifier(item)).includes(categoryCollection[i].parent?.id)) {
          result.push(categoryCollection[i]);
          categoryCollection.splice(i, 1);
        }
      }
      diff = result.length - diff;
      if (diff === 0) {
        if (categoryCollection.length > 0) {
          result.concat(categoryCollection);
        }
        break;
      }
    }
    return result;
  }

  protected findInChildren(category: ICategory, nodes: ICategoryNode[]): ICategoryNode | null | undefined {
    let result = null;
    for (const node of nodes) {
      if (isPresent(category.parent) && category.parent.id === node.id) {
        result = node;
        return result;
      } else {
        if (!isPresent(node.children) || node.children.length === 0) {
          // result = null;
        } else {
          result = this.findInChildren(category, node.children);
          if (result !== null) {
            return result;
          }
        }
      }
    }
    return result;
  }

  protected deepSort(arr: any[]): void {
    function compareNames(a: any, b: any): number {
      return a.name.toUpperCase() === b.name.toUpperCase() ? 0 : a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1;
    }
    arr.sort(compareNames);
    arr.forEach(node => {
      if (node.children) {
        this.deepSort(node.children);
      }
    });
  }
}
