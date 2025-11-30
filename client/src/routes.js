// Pages
// Admin/User Management Components
import ChangeUserPassword from "./components/users/ChangeUserPassword";
import ChangeUserPasswordByUser from "./pages/ChangeUserPasswordByUser";

// Root Admin pages
import AccountsPage from "./pages/AccountsPage";
import DashboardsPage from "./pages/DashboardsPage";
import InstancesPage from "./pages/InstancesPage";
import ReportsPage from "./pages/ReportsPage";
import WorkspacePage from "./pages/WorkspacePage";
import ShowDashboardPage from "./pages/ShowDashboardPage";
import UsersPage from "./pages/UsersPage";
import ManageAccountPage from "./pages/ManageAccountPage";
import ManageInstancePage from "./pages/ManageInstancePage";
import ManageDashboardPage from "./pages/ManageDashboardPage";
import ManageWorkspacePage from "./pages/ManageWorkspacePage";
import ManageReportPage from "./pages/ManageReportPage";
import ManageUserPage from "./pages/ManageUserPage";
import AssignDashboardsToUser from "./components/usersDashboards/AssignDashboardsToUser";

export const rootAdminRoutes = {
  // Accounts
  accounts: {
    name: "Cuentas",
    path: "/accounts",
    element: AccountsPage,
  },
  createAccount: {
    name: "Crear Cuenta",
    path: "/accounts/create",
    element: ManageAccountPage,
  },
  updateAccount: {
    name: "Editar Cuenta",
    path: "/accounts/update/:accountId",
    element: ManageAccountPage,
  },
  // Instances
  instances: {
    name: "Instancias",
    path: "/instances",
    element: InstancesPage,
  },
  createInstance: {
    name: "Crear Instancia",
    path: "/instances/create",
    element: ManageInstancePage,
  },
  updateInstance: {
    name: "Editar Instancia",
    path: "/instances/update/:instanceId",
    element: ManageInstancePage,
  },
  // Workspaces
  workspaces: {
    name: "Workspaces",
    path: "/workspaces",
    element: WorkspacePage,
  },
  createWorkspace: {
    name: "Crear Workspace",
    path: "/workspaces/create",
    element: ManageWorkspacePage,
  },
  updateWorkspace: {
    name: "Editar Workspace",
    path: "/workspaces/update/:workspaceId",
    element: ManageWorkspacePage,
  },
  // Reportes
  reports: {
    name: "Reportes",
    path: "/reports",
    element: ReportsPage,
  },
  createReport: {
    name: "Crear Reporte",
    path: "/reports/create",
    element: ManageReportPage,
  },
  updateReport: {
    name: "Editar Reporte",
    path: "/reports/update/:reportId",
    element: ManageReportPage,
  },
  // Dashboards
  dashboards: {
    name: "Dashboards",
    path: "/dashboards",
    element: DashboardsPage,
  },
  createDashboard: {
    name: "Vincular Dashboard",
    path: "/dashboards/create",
    element: ManageDashboardPage,
  },
  updateDashboard: {
    name: "Editar Dashboard",
    path: "/dashboards/update/:dashboardId",
    element: ManageDashboardPage,
  },
  showDashboard: {
    name: "Mostrar Panel",
    path: "/showDashboard/:dashboardId",
    element: ShowDashboardPage,
  },
  // Users
  users: {
    name: "Usuarios",
    path: "/users",
    element: UsersPage,
  },
  createUser: {
    name: "Crear Usuario",
    path: "/users/create",
    element: ManageUserPage,
  },
  updateUser: {
    name: "Editar Usuario",
    path: "/users/update/:userId",
    element: ManageUserPage,
  },
  changeUserPassword: {
    name: "Cambiar Contraseña Usuario",
    path: "/users/changePassword/:userId",
    element: ChangeUserPassword,
  },
  assignDashboardsToUser: {
    name: "Asignar Dashboards",
    path: "/users/:userId/assignDashboards",
    element: AssignDashboardsToUser,
  },
};

export const adminsRoutes = {
  // User Management (Tenant Admin manages users in their account)
  // Instances
  // instances: {
  //   name: "Instancias",
  //   path: "/instances",
  //   element: InstancesPage,
  // },
  // createInstance: {
  //   name: "Crear Instancia",
  //   path: "/instances/create",
  //   element: ManageInstancePage,
  // },
  // updateInstance: {
  //   name: "Editar Instancia",
  //   path: "/instances/update/:instanceId",
  //   element: ManageInstancePage,
  // },
  // Workspaces
  workspaces: {
    name: "Workspaces",
    path: "/workspaces",
    element: WorkspacePage,
  },
  createWorkspace: {
    name: "Crear Workspace",
    path: "/workspaces/create",
    element: ManageWorkspacePage,
  },
  updateWorkspace: {
    name: "Editar Workspace",
    path: "/workspaces/update/:workspaceId",
    element: ManageWorkspacePage,
  },
  // Reportes
  reports: {
    name: "Reportes",
    path: "/reports",
    element: ReportsPage,
  },
  createReport: {
    name: "Crear Reporte",
    path: "/reports/create",
    element: ManageReportPage,
  },
  updateReport: {
    name: "Editar Reporte",
    path: "/reports/update/:reportId",
    element: ManageReportPage,
  },
  // Dashboards
  dashboards: {
    name: "Dashboards",
    path: "/dashboards",
    element: DashboardsPage,
  },
  createDashboard: {
    name: "Vincular Dashboard",
    path: "/dashboards/create",
    element: ManageDashboardPage,
  },
  updateDashboard: {
    name: "Editar Dashboard",
    path: "/dashboards/update/:dashboardId",
    element: ManageDashboardPage,
  },
  showDashboard: {
    name: "Mostrar Panel",
    path: "/showDashboard/:dashboardId",
    element: ShowDashboardPage,
  },
  // Users
  users: {
    name: "Usuarios",
    path: "/users",
    element: UsersPage,
  },
  createUser: {
    name: "Crear Usuario",
    path: "/users/create",
    element: ManageUserPage,
  },
  updateUser: {
    name: "Editar Usuario",
    path: "/users/update/:userId",
    element: ManageUserPage,
  },
  changeUserPassword: {
    name: "Cambiar Contraseña Usuario",
    path: "/users/changePassword/:userId",
    element: ChangeUserPassword,
  },
  assignDashboardsToUser: {
    name: "Asignar Dashboards",
    path: "/users/:userId/assignDashboards",
    element: AssignDashboardsToUser,
  },
};

export const usersRoutes = {
  // Dashboards
  dashboards: {
    name: "Dashboards",
    path: "/dashboards",
    element: DashboardsPage,
  },
  showDashboard: {
    name: "Mostrar Panel",
    path: "/showDashboard/:dashboardId",
    element: ShowDashboardPage,
  },
  // Users
  changePassword: {
    name: "Cambiar Contraseña",
    path: "/changePassword",
    element: ChangeUserPasswordByUser,
  },
};
