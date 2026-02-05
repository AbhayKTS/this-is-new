/**
 * Community Service - Firebase Operations
 */

import { db, collections } from "../../config/firebase.js";
import studentService from "./studentService.js";

const communitiesRef = db.collection(collections.COMMUNITIES);
const postsRef = db.collection(collections.COMMUNITY_POSTS);

export const communityService = {
  /**
   * Get or create community for a college
   */
  async getOrCreateCommunity(collegeId, collegeName) {
    const existing = await communitiesRef.doc(collegeId).get();
    
    if (existing.exists) {
      return { id: existing.id, ...existing.data() };
    }
    
    // Create new community
    const communityData = {
      id: collegeId,
      collegeId,
      collegeName,
      membersCount: 0,
      postsCount: 0,
      activeMembers: 0,
      isPrivate: false,
      requiresVerification: false,
      moderatorIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await communitiesRef.doc(collegeId).set(communityData);
    return communityData;
  },
  
  /**
   * Get community by ID
   */
  async getById(id) {
    const doc = await communitiesRef.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },
  
  /**
   * Get all communities
   */
  async getAll(limit = 50) {
    const snapshot = await communitiesRef
      .orderBy("membersCount", "desc")
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  /**
   * Create a post
   */
  async createPost(data) {
    const user = await studentService.getById(data.authorId);
    if (!user) throw new Error("User not found");
    
    const postData = {
      communityId: data.communityId,
      collegeId: data.collegeId,
      
      authorId: data.authorId,
      authorName: user.name,
      authorRole: user.role,
      isVerifiedSenior: user.isVerifiedSenior,
      
      type: data.type || "discussion",
      title: data.title,
      body: data.body,
      attachments: data.attachments || [],
      tags: data.tags || [],
      
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
      
      isPinned: false,
      status: "published",
      
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const docRef = await postsRef.add(postData);
    
    // Update community post count
    const community = await this.getById(data.communityId);
    if (community) {
      await communitiesRef.doc(data.communityId).update({
        postsCount: (community.postsCount || 0) + 1,
        updatedAt: new Date(),
      });
    }
    
    return { id: docRef.id, ...postData };
  },
  
  /**
   * Get posts for a community
   */
  async getPosts(communityId, options = {}) {
    let query = postsRef
      .where("communityId", "==", communityId)
      .where("status", "==", "published");
    
    if (options.type) {
      query = query.where("type", "==", options.type);
    }
    
    // Pinned posts first, then by date
    query = query.orderBy("isPinned", "desc").orderBy("createdAt", "desc");
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  /**
   * Get post by ID
   */
  async getPostById(id) {
    const doc = await postsRef.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },
  
  /**
   * Like a post
   */
  async likePost(postId) {
    const post = await this.getPostById(postId);
    if (!post) throw new Error("Post not found");
    
    await postsRef.doc(postId).update({
      likesCount: (post.likesCount || 0) + 1,
    });
    
    return this.getPostById(postId);
  },
  
  /**
   * Increment view count
   */
  async incrementViews(postId) {
    const post = await this.getPostById(postId);
    if (!post) return;
    
    await postsRef.doc(postId).update({
      viewsCount: (post.viewsCount || 0) + 1,
    });
  },
  
  /**
   * Join community (increment member count)
   */
  async joinCommunity(communityId) {
    const community = await this.getById(communityId);
    if (!community) throw new Error("Community not found");
    
    await communitiesRef.doc(communityId).update({
      membersCount: (community.membersCount || 0) + 1,
      updatedAt: new Date(),
    });
  },
  
  /**
   * Leave community
   */
  async leaveCommunity(communityId) {
    const community = await this.getById(communityId);
    if (!community) return;
    
    await communitiesRef.doc(communityId).update({
      membersCount: Math.max(0, (community.membersCount || 0) - 1),
      updatedAt: new Date(),
    });
  },
};

export default communityService;

