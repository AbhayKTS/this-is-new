/**
 * Community Service - Firebase Implementation
 * Handles college-wise communities where students connect and share experiences
 */

import { communityService as firebaseCommunityService, studentService } from "./firebase/index.js";

// Create a new college community
export const createCommunity = async (payload) => {
  const { name, college_id, description, cover_image_url, created_by } = payload;
  
  // Get creator info
  const creator = await studentService.getById(created_by);
  
  const community = await firebaseCommunityService.create({
    name,
    collegeId: college_id,
    description,
    coverImage: cover_image_url,
    createdBy: created_by,
    creatorName: creator?.name || "Unknown",
  });
  
  // Auto-join creator to community
  await firebaseCommunityService.addMember(community.id, created_by, "admin");
  
  return community;
};

// Get community by ID
export const getCommunity = async (communityId) => {
  const community = await firebaseCommunityService.getById(communityId);
  
  if (!community) {
    throw new Error("Community not found");
  }
  
  return community;
};

// List all communities with optional filters
export const listCommunities = async ({ page = 1, pageSize = 20, collegeId = null, search = null }) => {
  const result = await firebaseCommunityService.list({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    collegeId,
    search,
  });
  
  return {
    data: result.data,
    total: result.total,
    page,
    pageSize,
    totalPages: Math.ceil(result.total / pageSize),
  };
};

// Join a community
export const joinCommunity = async (communityId, userId) => {
  const isMemberAlready = await firebaseCommunityService.isMember(communityId, userId);
  
  if (isMemberAlready) {
    return { alreadyMember: true };
  }
  
  await firebaseCommunityService.addMember(communityId, userId, "member");
  
  return { success: true };
};

// Leave a community
export const leaveCommunity = async (communityId, userId) => {
  await firebaseCommunityService.removeMember(communityId, userId);
  return { success: true };
};

// Get user's joined communities
export const getUserCommunities = async (userId) => {
  return await firebaseCommunityService.getUserCommunities(userId);
};

// Get community members
export const getCommunityMembers = async (communityId, { page = 1, pageSize = 50 }) => {
  const members = await firebaseCommunityService.getMembers(communityId, {
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
  
  return {
    data: members,
    total: members.length,
    page,
    pageSize,
  };
};

// Check if user is member
export const isMember = async (communityId, userId) => {
  return await firebaseCommunityService.isMember(communityId, userId);
};

// Create a post in community
export const createPost = async (communityId, userId, content) => {
  const user = await studentService.getById(userId);
  
  return await firebaseCommunityService.createPost(communityId, {
    authorId: userId,
    authorName: user?.name || "Anonymous",
    authorAvatar: user?.avatar || null,
    isVerifiedSenior: user?.isVerifiedSenior || false,
    content,
  });
};

// Get community posts
export const getCommunityPosts = async (communityId, { page = 1, pageSize = 20 }) => {
  const posts = await firebaseCommunityService.getPosts(communityId, {
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
  
  return {
    data: posts,
    total: posts.length,
    page,
    pageSize,
  };
};
