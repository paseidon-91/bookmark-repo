import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'profile',
        data: { pageTitle: 'bookmarkApp.profile.home.title' },
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule),
      },
      {
        path: 'category',
        data: { pageTitle: 'bookmarkApp.category.home.title' },
        loadChildren: () => import('./category/category.module').then(m => m.CategoryModule),
      },
      {
        path: 'item',
        data: { pageTitle: 'bookmarkApp.item.home.title' },
        loadChildren: () => import('./item/item.module').then(m => m.ItemModule),
      },
      {
        path: 'tag',
        data: { pageTitle: 'bookmarkApp.tag.home.title' },
        loadChildren: () => import('./tag/tag.module').then(m => m.TagModule),
      },
      /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
    ]),
  ],
})
export class EntityRoutingModule {}
