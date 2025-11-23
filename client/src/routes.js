// Pages
import ReportGroupsPage from "./pages/ReportGroupsPage";
import TestingPage from "./pages/TestingPage";
import UsersPage from "./pages/UsersPage";
import UsersGroupsPage from "./pages/UsersGroupsPage";
import ReportsPage from "./pages/ReportsPage";
import AccountPage from "./pages/AccountPage";

// Page like Components
import ManageUser from "./components/users/ManageUser";
import ChangeUserPassword from "./components/users/ChangeUserPassword";
import ManageReportsGroup from "./components/reports/ManageReportsGroup";
import ManageUsersGroups from "./components/usersGroups/ManageUsersGroups";
import ChangePassword from "./pages/ChangePassword";

// User pages
import UserReportsPage from "./pages/UserReportsPage";
import ChangeUserPasswordByUser from "./pages/ChangeUserPasswordByUser";

// Superuser pages
import AdminsPage from "./pages/AdminsPage";

export const superuserRoutes = {
  admins: {
    path: "/admins",
    element: AdminsPage,
  },
};

export const adminsRoutes = {
  // testingPage: {
  //   path: "/testing-page",
  //   element: TestingPage,
  // },
  reportsGroups: {
    path: "/reports-groups",
    element: ReportGroupsPage,
  },
  users: {
    path: "/users",
    element: UsersPage,
  },
  createUser: {
    path: "/users/create",
    element: ManageUser,
  },
  usersGroups: {
    path: "/user-groups",
    element: UsersGroupsPage,
  },
  createUsersGroup: {
    path: "/user-groups/create",
    element: ManageUsersGroups,
  },
  updateUsersGroups: {
    path: "/user-groups/update/:usersGroupId",
    element: ManageUsersGroups,
  },
  updateUser: {
    path: "/users/update/:userId",
    element: ManageUser,
  },
  changeUserPassword: {
    path: "/users/change-password/:userId",
    element: ChangeUserPassword,
  },
  showReport: {
    path: "/show-report",
    element: ReportsPage,
  },
  createReportsGroup: {
    path: "/reports-groups/create",
    element: ManageReportsGroup,
  },
  updateReportsGroup: {
    path: "/reports-groups/update/:reportsGroupId",
    element: ManageReportsGroup,
  },
  account: {
    path: "/account",
    element: AccountPage,
  },
  changePassword: { path: "/change-password", element: ChangePassword },
};

export const usersRoutes = {
  changePassword: {
    path: "/change-password",
    element: ChangeUserPasswordByUser,
  },
  showReport: { path: "/reports", element: UserReportsPage },
};
