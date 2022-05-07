import { Route } from '@angular/router';

import { BookmarksComponent } from './bookmarks.component';

export const HOME_ROUTE: Route = {
  path: '',
  component: BookmarksComponent,
  data: {
    pageTitle: 'bookmarks.title',
  },
};
