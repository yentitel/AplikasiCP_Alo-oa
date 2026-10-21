import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [

      // ==========================================
      // TAB 1 - DASHBOARD
      // ==========================================
      {
        path: 'tab1',
        loadChildren: () =>
          import('../tab1/tab1.module').then(
            m => m.Tab1PageModule
          )
      },

      // ==========================================
      // TAB 2 - DATA SISWA
      // ==========================================
      {
        path: 'tab2',
        loadChildren: () =>
          import('../tab2/tab2.module').then(
            m => m.Tab2PageModule
          )
      },

      // ==========================================
      // TAB 3 - PROSES AHC
      // ==========================================
      {
        path: 'tab3',
        loadChildren: () =>
          import('../tab3/tab3.module').then(
            m => m.Tab3PageModule
          )
      },

      // ==========================================
      // TAB 4 - HASIL CLUSTERING
      // ==========================================
      {
        path: 'tab4',
        loadChildren: () =>
          import('../tab4/tab4.module').then(
            m => m.Tab4PageModule
          )
      },

      // ==========================================
      // TAB 5
      // ==========================================
      {
        path: 'tab5',
        loadChildren: () =>
          import('../tab5/tab5.module').then(
            m => m.Tab5PageModule
          )
      },

      // ==========================================
      // DEFAULT TAB
      // ==========================================
      {
        path: '',
        redirectTo: 'tab1',
        pathMatch: 'full'
      }

    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class TabsPageRoutingModule {}