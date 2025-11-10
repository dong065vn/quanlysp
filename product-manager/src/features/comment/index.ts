/**
 * Comment Feature Module
 * Exports tất cả components, hooks, và API cho comment feature
 */

// Components
export { CommentSection } from './components/CommentSection';

// Hooks (re-export from hooks folder)
export {
  useComments,
  useCommentEdit,
  useCommentTime,
  useCommentAuthor,
} from '../../hooks/useComment';

// API (re-export from api folder)
export { commentAPI } from '../../api/comment.api';
