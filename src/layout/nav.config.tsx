import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import SupervisorAccountRoundedIcon from "@mui/icons-material/SupervisorAccountRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import ClassRoundedIcon from "@mui/icons-material/ClassRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import type { NavSection, UserRole } from "../types/Nav.types";

const SuperAdminNavigation: NavSection[] = [
  {
    subheader: "",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        path: "/dashboard",
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 22H6.5H8.5C9.60457 22 10.5 21.1046 10.5 20V4C10.5 2.89543 9.60457 2 8.5 2H4C2.89543 2 2 2.89543 2 4V20C2 21.1046 2.89543 22 4 22Z" stroke="#667085" stroke-width="1.5" />
          <path d="M13.5 4V11C13.5 12.1046 14.3954 13 15.5 13H20C21.1046 13 22 12.1046 22 11V4C22 2.89543 21.1046 2 20 2H15.5C14.3954 2 13.5 2.89543 13.5 4Z" stroke="#667085" stroke-width="1.5" />
          <path d="M13.5 20V18C13.5 16.8954 14.3954 16 15.5 16H20C21.1046 16 22 16.8954 22 18V20C22 21.1046 21.1046 22 20 22H15.5C14.3954 22 13.5 21.1046 13.5 20Z" stroke="#667085" stroke-width="1.5" />
        </svg>,
      },
      {
        id: "college-management",
        title: "Colleges",
        path: "/colleges",
        icon: <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.75 9.75H12.75M8.75 5.75H12.75M12.75 18.75V15.75C12.75 15.2196 12.5393 14.7109 12.1642 14.3358C11.7891 13.9607 11.2804 13.75 10.75 13.75C10.2196 13.75 9.71086 13.9607 9.33579 14.3358C8.96071 14.7109 8.75 15.2196 8.75 15.75V18.75M4.75 7.75H2.75C2.21957 7.75 1.71086 7.96071 1.33579 8.33579C0.960714 8.71086 0.75 9.21957 0.75 9.75V16.75C0.75 17.2804 0.960714 17.7891 1.33579 18.1642C1.71086 18.5393 2.21957 18.75 2.75 18.75H18.75C19.2804 18.75 19.7891 18.5393 20.1642 18.1642C20.5393 17.7891 20.75 17.2804 20.75 16.75V6.75C20.75 6.21957 20.5393 5.71086 20.1642 5.33579C19.7891 4.96071 19.2804 4.75 18.75 4.75H16.75M4.75 18.75V2.75C4.75 2.21957 4.96071 1.71086 5.33579 1.33579C5.71086 0.960714 6.21957 0.75 6.75 0.75H14.75C15.2804 0.75 15.7891 0.960714 16.1642 1.33579C16.5393 1.71086 16.75 2.21957 16.75 2.75V18.75" stroke="#667085" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        ,
      },
      {
        id: "offers",
        title: "Offers",
        path: "/offers",
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21072 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8M14 2C14.3166 1.99949 14.6301 2.06161 14.9225 2.18277C15.215 2.30394 15.4806 2.48176 15.704 2.706L19.292 6.294C19.5168 6.51751 19.6952 6.78335 19.8167 7.07616C19.9382 7.36898 20.0005 7.68297 20 8M14 2V7C14 7.26522 14.1054 7.51957 14.2929 7.70711C14.4804 7.89464 14.7348 8 15 8L20 8M10 9H8M16 13H8M16 17H8" stroke="#667085" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>,
      },
      {
        id: "usage-analytics",
        title: "Usage & Analytics",
        path: "/analytics",
        icon: <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.75 13.75V18.75M14.75 11.75V18.75M18.75 7.75V18.75M20.75 0.75L12.104 9.396C12.0576 9.44256 12.0024 9.47951 11.9416 9.50471C11.8809 9.52992 11.8158 9.54289 11.75 9.54289C11.6842 9.54289 11.6191 9.52992 11.5584 9.50471C11.4976 9.47951 11.4424 9.44256 11.396 9.396L8.104 6.104C8.01024 6.01026 7.88308 5.95761 7.7505 5.95761C7.61792 5.95761 7.49076 6.01026 7.397 6.104L0.75 12.75M2.75 15.75V18.75M6.75 11.75V18.75" stroke="#667085" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        ,
      },
      {
        id: "payments",
        title: "Payments",
        path: "/payments",
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 16V20C21 20.2652 20.8946 20.5196 20.7071 20.7071C20.5196 20.8946 20.2652 21 20 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H18C18.2652 3 18.5196 3.10536 18.7071 3.29289C18.8946 3.48043 19 3.73478 19 4V7M3 5C3 5.53043 3.21071 6.03914 3.58579 6.41421C3.96086 6.78929 4.46957 7 5 7H20C20.2652 7 20.5196 7.10536 20.7071 7.29289C20.8946 7.48043 21 7.73478 21 8V12M21 12H18C17.4696 12 16.9609 12.2107 16.5858 12.5858C16.2107 12.9609 16 13.4696 16 14C16 14.5304 16.2107 15.0391 16.5858 15.4142C16.9609 15.7893 17.4696 16 18 16H21M21 12C21.2652 12 21.5196 12.1054 21.7071 12.2929C21.8946 12.4804 22 12.7348 22 13V15C22 15.2652 21.8946 15.5196 21.7071 15.7071C21.5196 15.8946 21.2652 16 21 16" stroke="#667085" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>,
        disabled: true,
      },
      {
        id: "settings",
        title: "Settings",
        path: "/settings",
        icon: <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.37736 2.86857C7.43246 2.28891 7.70169 1.75062 8.13246 1.35885C8.56323 0.967088 9.12459 0.75 9.70686 0.75C10.2891 0.75 10.8505 0.967088 11.2813 1.35885C11.712 1.75062 11.9813 2.28891 12.0364 2.86857C12.0695 3.24303 12.1923 3.60399 12.3945 3.92091C12.5967 4.23783 12.8722 4.50138 13.1978 4.68925C13.5234 4.87712 13.8895 4.98378 14.2651 5.00019C14.6406 5.01661 15.0146 4.94231 15.3554 4.78357C15.8845 4.54335 16.484 4.50859 17.0374 4.68606C17.5907 4.86353 18.0582 5.24052 18.3489 5.74368C18.6396 6.24683 18.7326 6.84015 18.61 7.40814C18.4874 7.97614 18.1578 8.47819 17.6854 8.81657C17.3777 9.03242 17.1266 9.31918 16.9533 9.6526C16.7799 9.98602 16.6894 10.3563 16.6894 10.7321C16.6894 11.1079 16.7799 11.4781 16.9533 11.8115C17.1266 12.145 17.3777 12.4317 17.6854 12.6476C18.1578 12.986 18.4874 13.488 18.61 14.056C18.7326 14.624 18.6396 15.2173 18.3489 15.7205C18.0582 16.2236 17.5907 16.6006 17.0374 16.7781C16.484 16.9556 15.8845 16.9208 15.3554 16.6806C15.0146 16.5218 14.6406 16.4475 14.2651 16.464C13.8895 16.4804 13.5234 16.587 13.1978 16.7749C12.8722 16.9628 12.5967 17.2263 12.3945 17.5432C12.1923 17.8602 12.0695 18.2211 12.0364 18.5956C11.9813 19.1752 11.712 19.7135 11.2813 20.1053C10.8505 20.4971 10.2891 20.7141 9.70686 20.7141C9.12459 20.7141 8.56323 20.4971 8.13246 20.1053C7.70169 19.7135 7.43246 19.1752 7.37736 18.5956C7.3443 18.221 7.22146 17.8599 7.01922 17.5428C6.81699 17.2258 6.54133 16.9622 6.21559 16.7743C5.88985 16.5864 5.52363 16.4798 5.14794 16.4635C4.77225 16.4472 4.39816 16.5216 4.05736 16.6806C3.52825 16.9208 2.92869 16.9556 2.37536 16.7781C1.82203 16.6006 1.35453 16.2236 1.06384 15.7205C0.773153 15.2173 0.680074 14.624 0.802719 14.056C0.925365 13.488 1.25496 12.986 1.72736 12.6476C2.03498 12.4317 2.28609 12.145 2.45945 11.8115C2.63281 11.4781 2.72331 11.1079 2.72331 10.7321C2.72331 10.3563 2.63281 9.98602 2.45945 9.6526C2.28609 9.31918 2.03498 9.03242 1.72736 8.81657C1.25562 8.47802 0.926609 7.97617 0.804261 7.40856C0.681912 6.84094 0.774968 6.24811 1.06534 5.74529C1.35572 5.24246 1.82267 4.86555 2.37545 4.68781C2.92823 4.51008 3.52734 4.54421 4.05636 4.78357C4.39712 4.94231 4.7711 5.01661 5.14666 5.00019C5.52222 4.98378 5.88829 4.87712 6.2139 4.68925C6.5395 4.50138 6.81505 4.23783 7.01722 3.92091C7.2194 3.60399 7.34224 3.24303 7.37536 2.86857M12.7063 10.7324C12.7063 12.3893 11.3632 13.7324 9.7063 13.7324C8.04944 13.7324 6.7063 12.3893 6.7063 10.7324C6.7063 9.07557 8.04944 7.73242 9.7063 7.73242C11.3632 7.73242 12.7063 9.07557 12.7063 10.7324Z" stroke="#667085" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        ,
      },
    ],
  },
];

export const navigationConfig: NavSection[] = [
  {
    subheader: "Overview",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        path: "/dashboard",
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 22H6.5H8.5C9.60457 22 10.5 21.1046 10.5 20V4C10.5 2.89543 9.60457 2 8.5 2H4C2.89543 2 2 2.89543 2 4V20C2 21.1046 2.89543 22 4 22Z" stroke="#667085" stroke-width="1.5" />
          <path d="M13.5 4V11C13.5 12.1046 14.3954 13 15.5 13H20C21.1046 13 22 12.1046 22 11V4C22 2.89543 21.1046 2 20 2H15.5C14.3954 2 13.5 2.89543 13.5 4Z" stroke="#667085" stroke-width="1.5" />
          <path d="M13.5 20V18C13.5 16.8954 14.3954 16 15.5 16H20C21.1046 16 22 16.8954 22 18V20C22 21.1046 21.1046 22 20 22H15.5C14.3954 22 13.5 21.1046 13.5 20Z" stroke="#667085" stroke-width="1.5" />
        </svg>,
        roles: ["ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ROLE_TEACHER", "ROLE_STUDENT"],
      },
      {
        id: "analytics",
        title: "Analytics",
        path: "/analytics",
        icon: <BarChartRoundedIcon fontSize="small" />,
        roles: ["ROLE_SUPER_ADMIN", "ROLE_ADMIN"],
        badge: "Live",
        badgeColor: "success",
      },
      {
        id: "reports",
        title: "Reports",
        path: "/reports",
        icon: <AssessmentRoundedIcon fontSize="small" />,
        roles: ["ROLE_SUPER_ADMIN", "ROLE_ADMIN"],
      },
    ],
  },
  {
    subheader: "Platform Control",
    items: [
      {
        id: "platform-settings",
        title: "Platform Settings",
        path: "/platform-settings",
        icon: <TuneRoundedIcon fontSize="small" />,
        roles: ["ROLE_SUPER_ADMIN"],
      },
      {
        id: "admin-management",
        title: "Admin Management",
        path: "/admin-management",
        icon: <AdminPanelSettingsRoundedIcon fontSize="small" />,
        roles: ["ROLE_SUPER_ADMIN"],
        badge: "New",
        badgeColor: "error",
      },
      {
        id: "roles-security",
        title: "Roles & Security",
        path: "/roles-security",
        icon: <SecurityRoundedIcon fontSize="small" />,
        roles: ["ROLE_SUPER_ADMIN"],
      },
    ],
  },

  {
    subheader: "Management",
    items: [
      {
        id: "user-management",
        title: "User Management",
        path: "/users",
        icon: <PeopleAltRoundedIcon fontSize="small" />,
        roles: ["ROLE_SUPER_ADMIN", "ROLE_ADMIN"],
      },
      {
        id: "teacher-management",
        title: "Teachers",
        path: "/teachers",
        icon: <SupervisorAccountRoundedIcon fontSize="small" />,
        roles: ["ROLE_SUPER_ADMIN", "ROLE_ADMIN"],
      },
      {
        id: "student-management",
        title: "Students",
        path: "/students",
        icon: <GroupRoundedIcon fontSize="small" />,
        roles: ["ROLE_SUPER_ADMIN", "ROLE_ADMIN"],
      },
      {
        id: "college-management",
        title: "Colleges",
        path: "/colleges",
        icon: <AccountBalanceRoundedIcon fontSize="small" />,
        roles: ["ROLE_SUPER_ADMIN", "ROLE_ADMIN"],
      },
    ],
  },

  {
    subheader: "Courses & Content",
    items: [
      {
        id: "courses",
        title: "Courses",
        path: "/courses",
        icon: <SchoolRoundedIcon fontSize="small" />,
        roles: ["ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ROLE_TEACHER", "ROLE_PUBLIC"],
      },
      {
        id: "my-courses",
        title: "My Courses",
        path: "/my-courses",
        icon: <BookmarkRoundedIcon fontSize="small" />,
        roles: ["ROLE_STUDENT"],
      },
      {
        id: "curriculum",
        title: "Curriculum",
        path: "/curriculum",
        icon: <MenuBookRoundedIcon fontSize="small" />,
        roles: ["ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ROLE_TEACHER"],
      },
      {
        id: "assignments",
        title: "Assignments",
        path: "/assignments",
        icon: <AssignmentRoundedIcon fontSize="small" />,
        roles: ["ROLE_TEACHER", "ROLE_STUDENT"],
        badge: 4,
        badgeColor: "warning",
      },
      {
        id: "my-class",
        title: "My Class",
        path: "/my-class",
        icon: <ClassRoundedIcon fontSize="small" />,
        roles: ["ROLE_TEACHER"],
      },
      {
        id: "explore",
        title: "Explore Courses",
        path: "/explore",
        icon: <ExploreRoundedIcon fontSize="small" />,
        roles: ["ROLE_PUBLIC"],
      },
    ],
  },

  {
    subheader: "Offers & Billing",
    items: [
      {
        id: "offers",
        title: "Offers",
        path: "/offers",
        icon: <LocalOfferRoundedIcon fontSize="small" />,
        roles: ["ROLE_SUPER_ADMIN", "ROLE_ADMIN"],
      },
      {
        id: "payments",
        title: "Payments",
        path: "/payments",
        icon: <PaymentRoundedIcon fontSize="small" />,
        roles: ["ROLE_SUPER_ADMIN", "ROLE_ADMIN"],
      },
    ],
  },

  {
    subheader: "Configuration",
    items: [
      {
        id: "notifications",
        title: "Notifications",
        path: "/notifications",
        icon: <NotificationsRoundedIcon fontSize="small" />,
        roles: ["ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ROLE_TEACHER", "ROLE_STUDENT"],
      },
      {
        id: "settings",
        title: "Settings",
        path: "/settings",
        icon: <SettingsRoundedIcon fontSize="small" />,
        roles: ["ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ROLE_TEACHER", "ROLE_STUDENT", "ROLE_PUBLIC"],
      },
    ],
  },
];

export const getFilteredNavigation = (
  sections: NavSection[],
  currentRole: UserRole
): NavSection[] => {
  if (currentRole === "ROLE_SUPER_ADMIN") {
    return SuperAdminNavigation;
  }

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.roles || item.roles.includes(currentRole)
      ),
    }))
    .filter((section) => section.items.length > 0);
};
