import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'app/shared/shared.module';
import { HOME_ROUTE } from './bookmarks.route';
import { BookmarksComponent } from './bookmarks.component';
import { TreeModule } from '@circlon/angular-tree-component';

@NgModule({
  imports: [SharedModule, RouterModule.forChild([HOME_ROUTE]), TreeModule],
  declarations: [BookmarksComponent],
})
export class BookmarksModule {}
