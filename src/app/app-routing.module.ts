import { NgModule } from '@angular/core';
import {
  PreloadAllModules,
  RouterModule,
  Routes
} from '@angular/router';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  // LOGIN
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then(
        m => m.LoginPageModule
      )
  },

  // RESET PASSWORD
  {
    path: 'reset-password',
    loadChildren: () =>
      import('./reset-password/reset-password.module').then(
        m => m.ResetPasswordPageModule
      )
  },

  // TABS
  {
    path: 'tabs',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./tabs/tabs.module').then(
        m => m.TabsPageModule
      )
  },

  // HALAMAN AWAL
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // ROUTE TIDAK DITEMUKAN
  {
    path: '**',
    redirectTo: '/login'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}