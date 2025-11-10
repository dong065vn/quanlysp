import { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Trash2, Edit as EditIcon, Check, X } from 'lucide-react';
import type { ProductComment } from '../types/product';
import { commentService } from '../services/commentService';
import { toast } from './Toast';

interface CommentSectionProps {
  productId: string;
  shareToken: string;
  readOnly?: boolean;
}

export function CommentSection({ productId, shareToken, readOnly = false }: CommentSectionProps) {
  const [comments, setComments] = useState<ProductComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Load comments
  useEffect(() => {
    loadComments();
  }, [productId]);

  const loadComments = () => {
    const allComments = commentService.getCommentsByProductId(productId);
    setComments(allComments);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast.error('Vui lòng nhập nội dung nhận xét');
      return;
    }

    if (!authorName.trim()) {
      toast.error('Vui lòng nhập tên của bạn');
      return;
    }

    try {
      commentService.createComment(productId, shareToken, authorName.trim(), newComment.trim());
      setNewComment('');
      loadComments();
      toast.success('✅ Đã thêm nhận xét thành công!');
    } catch (error) {
      toast.error('❌ Không thể thêm nhận xét');
    }
  };

  const handleEditComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setEditingCommentId(commentId);
      setEditContent(comment.content);
    }
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editContent.trim()) {
      toast.error('Nội dung không được để trống');
      return;
    }

    try {
      commentService.updateComment(commentId, editContent.trim());
      setEditingCommentId(null);
      setEditContent('');
      loadComments();
      toast.success('✅ Đã cập nhật nhận xét!');
    } catch (error) {
      toast.error('❌ Không thể cập nhật nhận xét');
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa nhận xét này?')) {
      try {
        commentService.deleteComment(commentId);
        loadComments();
        toast.success('✅ Đã xóa nhận xét!');
      } catch (error) {
        toast.error('❌ Không thể xóa nhận xét');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <MessageSquare size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Nhận xét</h3>
            <p className="text-sm text-white/80">
              {comments.length} {comments.length === 1 ? 'nhận xét' : 'nhận xét'}
            </p>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Chưa có nhận xét nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:border-green-300 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                  <User size={20} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-bold text-gray-900">{comment.author}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                        {comment.updatedAt && ' (đã chỉnh sửa)'}
                      </div>
                    </div>
                    {!readOnly && comment.shareToken === shareToken && (
                      <div className="flex items-center gap-2">
                        {editingCommentId === comment.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(comment.id)}
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-all duration-200"
                              title="Lưu"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-all duration-200"
                              title="Hủy"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditComment(comment.id)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200"
                              title="Chỉnh sửa"
                            >
                              <EditIcon size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200"
                              title="Xóa"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {editingCommentId === comment.id ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows={3}
                      autoFocus
                    />
                  ) : (
                    <p className="text-gray-700 text-sm whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      {!readOnly && (
        <form onSubmit={handleSubmitComment} className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="space-y-3">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Tên của bạn"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              maxLength={50}
            />
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Nhập nhận xét của bạn..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all duration-200"
              rows={3}
              maxLength={1000}
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              <Send size={18} />
              <span>Gửi nhận xét</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
