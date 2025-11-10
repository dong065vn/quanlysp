/**
 * Share Link Feature Module
 * Exports tất cả components, hooks, và API cho share link feature
 */

// Components
export { ShareDialog } from './components/ShareDialog';
export { SheetShareDialog } from './components/SheetShareDialog';
export { ProductViewer } from './components/ProductViewer';
export { SheetViewer } from './components/SheetViewer';
export {
  ViewOnlyBanner,
  ViewOnlyBadge,
  MobileViewOnlyNotice
} from './components/ViewOnlyBanner';

// Hooks (re-export from hooks folder)
export {
  useShareLinks,
  useShareLinkFromURL,
  useProductFromShareLink,
  useCopyShareLink,
} from '../../hooks/useShareLink';

export {
  useReadOnlyGuard,
  usePermissionBadge,
} from '../../hooks/useReadOnlyGuard';

// API (re-export from api folder)
export { shareLinkAPI } from '../../api/shareLink.api';
