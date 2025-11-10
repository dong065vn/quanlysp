/**
 * API Layer cho Comment
 * Cung cấp interface để giao tiếp với Comment Service
 * Tách biệt business logic khỏi UI components
 */

import type { ProductComment } from '../types/product';
import { commentService } from '../services/commentService';

/**
 * Response wrapper cho API calls
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Comment API Class
 * Tất cả giao tiếp với comment service phải thông qua API này
 */
class CommentAPI {
  /**
   * Lấy tất cả comments
   */
  async getAllComments(): Promise<ApiResponse<ProductComment[]>> {
    try {
      const comments = commentService.getAllComments();
      return {
        success: true,
        data: comments,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch comments',
      };
    }
  }

  /**
   * Lấy comments của một sản phẩm
   */
  async getCommentsByProductId(productId: string): Promise<ApiResponse<ProductComment[]>> {
    try {
      const comments = commentService.getCommentsByProductId(productId);
      return {
        success: true,
        data: comments,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch product comments',
      };
    }
  }

  /**
   * Lấy comments theo token
   */
  async getCommentsByToken(
    productId: string,
    shareToken: string
  ): Promise<ApiResponse<ProductComment[]>> {
    try {
      const comments = commentService.getCommentsByToken(productId, shareToken);
      return {
        success: true,
        data: comments,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch token comments',
      };
    }
  }

  /**
   * Tạo comment mới
   */
  async createComment(
    productId: string,
    shareToken: string,
    author: string,
    content: string,
    parentId?: string
  ): Promise<ApiResponse<ProductComment>> {
    try {
      // Validation
      if (!author.trim()) {
        return {
          success: false,
          error: 'Author name is required',
        };
      }

      if (!content.trim()) {
        return {
          success: false,
          error: 'Comment content is required',
        };
      }

      const comment = commentService.createComment(
        productId,
        shareToken,
        author.trim(),
        content.trim(),
        parentId
      );

      return {
        success: true,
        data: comment,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create comment',
      };
    }
  }

  /**
   * Cập nhật comment
   */
  async updateComment(
    commentId: string,
    content: string
  ): Promise<ApiResponse<ProductComment | null>> {
    try {
      // Validation
      if (!content.trim()) {
        return {
          success: false,
          error: 'Comment content is required',
        };
      }

      const comment = commentService.updateComment(commentId, content.trim());

      if (!comment) {
        return {
          success: false,
          error: 'Comment not found',
        };
      }

      return {
        success: true,
        data: comment,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update comment',
      };
    }
  }

  /**
   * Xóa comment
   */
  async deleteComment(commentId: string): Promise<ApiResponse<boolean>> {
    try {
      const success = commentService.deleteComment(commentId);

      return {
        success,
        data: success,
        error: success ? undefined : 'Comment not found',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete comment',
      };
    }
  }

  /**
   * Xóa tất cả comments của sản phẩm
   */
  async deleteCommentsByProductId(productId: string): Promise<ApiResponse<void>> {
    try {
      commentService.deleteCommentsByProductId(productId);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete product comments',
      };
    }
  }

  /**
   * Lấy số lượng comments của sản phẩm
   */
  async getCommentCount(productId: string): Promise<ApiResponse<number>> {
    try {
      const count = commentService.getCommentCount(productId);
      return {
        success: true,
        data: count,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get comment count',
      };
    }
  }

  /**
   * Lấy top-level comments (không phải reply)
   */
  async getTopLevelComments(productId: string): Promise<ApiResponse<ProductComment[]>> {
    try {
      const comments = commentService.getTopLevelComments(productId);
      return {
        success: true,
        data: comments,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch top-level comments',
      };
    }
  }

  /**
   * Lấy replies của một comment
   */
  async getReplies(commentId: string): Promise<ApiResponse<ProductComment[]>> {
    try {
      const replies = commentService.getReplies(commentId);
      return {
        success: true,
        data: replies,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch replies',
      };
    }
  }
}

// Export singleton instance
export const commentAPI = new CommentAPI();
