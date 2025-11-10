/**
 * Hooks Index
 * Export tất cả custom hooks
 */

// Share Link Hooks
export {
  useShareLinks,
  useShareLinkFromURL,
  useProductFromShareLink,
  useCopyShareLink,
} from './useShareLink';

// Comment Hooks
export {
  useComments,
  useCommentEdit,
  useCommentTime,
  useCommentAuthor,
} from './useComment';

// Read-Only Guard Hooks
export {
  useReadOnlyGuard,
  usePermissionBadge,
} from './useReadOnlyGuard';
