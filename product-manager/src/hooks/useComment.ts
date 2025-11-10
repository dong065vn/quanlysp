/**
 * Custom Hook cho Comment Business Logic
 * Tách biệt business logic khỏi UI components
 */

import { useState, useCallback, useEffect } from 'react';
import type { ProductComment } from '../types/product';
import { commentAPI } from '../api/comment.api';

/**
 * Hook để quản lý comments của một sản phẩm
 */
export function useComments(productId: string, shareToken?: string) {
  const [comments, setComments] = useState<ProductComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load comments
  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = shareToken
      ? await commentAPI.getCommentsByToken(productId, shareToken)
      : await commentAPI.getCommentsByProductId(productId);

    if (response.success && response.data) {
      setComments(response.data);
    } else {
      setError(response.error || 'Failed to load comments');
    }

    setLoading(false);
  }, [productId, shareToken]);

  // Load comments khi component mount
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Tạo comment mới
  const createComment = useCallback(async (
    author: string,
    content: string,
    parentId?: string
  ) => {
    setLoading(true);
    setError(null);

    const response = await commentAPI.createComment(
      productId,
      shareToken || '',
      author,
      content,
      parentId
    );

    if (response.success && response.data) {
      setComments(prev => [...prev, response.data!]);
      setLoading(false);
      return response.data;
    } else {
      setError(response.error || 'Failed to create comment');
      setLoading(false);
      return null;
    }
  }, [productId, shareToken]);

  // Cập nhật comment
  const updateComment = useCallback(async (commentId: string, content: string) => {
    setLoading(true);
    setError(null);

    const response = await commentAPI.updateComment(commentId, content);

    if (response.success && response.data) {
      setComments(prev =>
        prev.map(c => (c.id === commentId ? response.data! : c))
      );
      setLoading(false);
      return response.data;
    } else {
      setError(response.error || 'Failed to update comment');
      setLoading(false);
      return null;
    }
  }, []);

  // Xóa comment
  const deleteComment = useCallback(async (commentId: string) => {
    setLoading(true);
    setError(null);

    const response = await commentAPI.deleteComment(commentId);

    if (response.success) {
      setComments(prev => prev.filter(c => c.id !== commentId));
      setLoading(false);
      return true;
    } else {
      setError(response.error || 'Failed to delete comment');
      setLoading(false);
      return false;
    }
  }, []);

  // Lấy top-level comments
  const topLevelComments = comments.filter(c => !c.parentId);

  // Lấy replies của một comment
  const getReplies = useCallback((commentId: string) => {
    return comments.filter(c => c.parentId === commentId);
  }, [comments]);

  // Lấy số lượng comments
  const commentCount = comments.length;

  return {
    comments,
    topLevelComments,
    loading,
    error,
    commentCount,
    loadComments,
    createComment,
    updateComment,
    deleteComment,
    getReplies,
  };
}

/**
 * Hook để quản lý trạng thái edit comment
 */
export function useCommentEdit() {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const startEdit = useCallback((commentId: string, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditContent(currentContent);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setEditContent('');
  }, []);

  const isEditing = (commentId: string) => editingCommentId === commentId;

  return {
    editingCommentId,
    editContent,
    setEditContent,
    startEdit,
    cancelEdit,
    isEditing,
  };
}

/**
 * Hook để format thời gian comment
 */
export function useCommentTime(timestamp: string) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date();
      const commentTime = new Date(timestamp);
      const diffMs = now.getTime() - commentTime.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) {
        setTimeAgo('vừa xong');
      } else if (diffMins < 60) {
        setTimeAgo(`${diffMins} phút trước`);
      } else if (diffHours < 24) {
        setTimeAgo(`${diffHours} giờ trước`);
      } else if (diffDays < 7) {
        setTimeAgo(`${diffDays} ngày trước`);
      } else {
        setTimeAgo(commentTime.toLocaleDateString('vi-VN'));
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update mỗi phút

    return () => clearInterval(interval);
  }, [timestamp]);

  return timeAgo;
}

/**
 * Hook để quản lý author của user hiện tại
 */
export function useCommentAuthor() {
  const [author, setAuthor] = useState('');

  useEffect(() => {
    // Lấy author từ localStorage nếu có
    const savedAuthor = localStorage.getItem('comment_author');
    if (savedAuthor) {
      setAuthor(savedAuthor);
    }
  }, []);

  const saveAuthor = useCallback((name: string) => {
    setAuthor(name);
    localStorage.setItem('comment_author', name);
  }, []);

  return {
    author,
    setAuthor: saveAuthor,
  };
}
