import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login.component';
import { AgentLayoutComponent } from './features/agent/agent-layout/agent-layout.component';
import { AgentAccountsComponent } from './features/agent/agent-accounts/agent-accounts.component';
import { AgentCustomersComponent } from './features/agent/agent-customers/agent-customers.component';
import { CustomerDashboardComponent } from './features/customer/customer-dashboard/customer-dashboard.component';
import { CustomerLayoutComponent } from './features/customer/customer-layout/customer-layout.component';
import { CustomerSettingsComponent } from './features/customer/customer-settings/customer-settings.component';
import { TransferComponent } from './features/customer/transfer/transfer.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  {
    path: 'agent',
    component: AgentLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'AGENT' },
    children: [
      { path: 'customers', component: AgentCustomersComponent },
      { path: 'accounts', component: AgentAccountsComponent },
      { path: '', pathMatch: 'full', redirectTo: 'customers' }
    ]
  },
  {
    path: 'customer',
    component: CustomerLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'CUSTOMER' },
    children: [
      { path: 'dashboard', component: CustomerDashboardComponent },
      { path: 'transfer', component: TransferComponent },
      { path: 'settings', component: CustomerSettingsComponent },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
