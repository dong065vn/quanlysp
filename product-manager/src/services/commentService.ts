import type { ProductComment } from '../types/product';

const STORAGE_KEY = 'product_comments';

/**
 * Service quản lý comment cho sản phẩm
 */
class CommentService {
  /**
   * Lấy tất cả comments
   */
  getAllComments(): ProductComment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading comments:', error);
      return [];
    }
  }

  /**
   * Lấy comments của một sản phẩm
   */
  getCommentsByProductId(productId: string): ProductComment[] {
    const comments = this.getAllComments();
    return comments.filter(c => c.productId === productId);
  }

  /**
   * Lấy comments của một sản phẩm theo token
   */
  getCommentsByToken(productId: string, shareToken: string): ProductComment[] {
    const comments = this.getAllComments();
    return comments.filter(c => c.productId === productId && c.shareToken === shareToken);
  }

  /**
   * Tạo comment mới
   */
  createComment(
    productId: string,
    shareToken: string,
    author: string,
    content: string,
    parentId?: string
  ): ProductComment {
    const comment: ProductComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId,
      shareToken,
      author,
      content,
      createdAt: new Date().toISOString(),
      parentId,
    };

    const comments = this.getAllComments();
    comments.push(comment);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));

    return comment;
  }

  /**
   * Cập nhật comment
   */
  updateComment(commentId: string, content: string): ProductComment | null {
    const comments = this.getAllComments();
    const index = comments.findIndex(c => c.id === commentId);

    if (index === -1) return null;

    comments[index] = {
      ...comments[index],
      content,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));

    return comments[index];
  }

  /**
   * Xóa comment
   */
  deleteComment(commentId: string): boolean {
    const comments = this.getAllComments();
    const filtered = comments.filter(c => c.id !== commentId);

    if (filtered.length === comments.length) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  /**
   * Xóa tất cả comments của một sản phẩm
   */
  deleteCommentsByProductId(productId: string): void {
    const comments = this.getAllComments();
    const filtered = comments.filter(c => c.productId !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Lấy số lượng comments của một sản phẩm
   */
  getCommentCount(productId: string): number {
    return this.getCommentsByProductId(productId).length;
  }

  /**
   * Lấy comments cấp 1 (không phải reply)
   */
  getTopLevelComments(productId: string): ProductComment[] {
    const comments = this.getCommentsByProductId(productId);
    return comments.filter(c => !c.parentId);
  }

  /**
   * Lấy replies của một comment
   */
  getReplies(commentId: string): ProductComment[] {
    const comments = this.getAllComments();
    return comments.filter(c => c.parentId === commentId);
  }
}

export const commentService = new CommentService();
