import Home from './pages/Home.svelte';
import About from './pages/About.svelte';
import Projects from './pages/Projects.svelte';
import Activities from './pages/Activities.svelte';
import ActivityDetail from './pages/ActivityDetail.svelte';
import Documents from './pages/Documents.svelte';
import DocumentDetail from './pages/DocumentDetail.svelte';
import Announcements from './pages/Announcements.svelte';
import Login from './pages/Login.svelte';
import Join from './pages/Join.svelte';
import Serve from './pages/Serve.svelte';
import Contact from './pages/Contact.svelte';
import Rules from './pages/Rules.svelte';
import Development from './pages/Development.svelte';
import Awards from './pages/Awards.svelte';
import NotFound from './pages/NotFound.svelte';

import AdminDashboard from './pages/admin/Dashboard.svelte';
import ManageProjects from './pages/admin/ManageProjects.svelte';
import ManageActivities from './pages/admin/ManageActivities.svelte';
import ManageDocuments from './pages/admin/ManageDocuments.svelte';
import ManageAnnouncements from './pages/admin/ManageAnnouncements.svelte';
import ManageImages from './pages/admin/ManageImages.svelte';
import ManageAccounts from './pages/admin/ManageAccounts.svelte';
import ProjectForm from './pages/admin/ProjectForm.svelte';
import ActivityForm from './pages/admin/ActivityForm.svelte';
import DocumentForm from './pages/admin/DocumentForm.svelte';

export const routes = {
  '/': Home,
  '/about': About,
  '/projects': Projects,
  '/activities': Activities,
  '/activities/:id': ActivityDetail,
  '/documents': Documents,
  '/documents/:id': DocumentDetail,
  '/announcements': Announcements,
  '/login': Login,
  '/join': Join,
  '/serve': Serve,
  '/contact': Contact,
  '/rules': Rules,
  '/development': Development,
  '/awards': Awards,

  '/admin': AdminDashboard,
  '/admin/projects': ManageProjects,
  '/admin/projects/new': ProjectForm,
  '/admin/projects/:id': ProjectForm,
  '/admin/activities': ManageActivities,
  '/admin/activities/new': ActivityForm,
  '/admin/activities/:id': ActivityForm,
  '/admin/documents': ManageDocuments,
  '/admin/documents/new': DocumentForm,
  '/admin/documents/:id': DocumentForm,
  '/admin/announcements': ManageAnnouncements,
  '/admin/images': ManageImages,
  '/admin/accounts': ManageAccounts,

  '*': NotFound
};
