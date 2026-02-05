import {
  createCommunity,
  getCommunity,
  listCommunities,
  joinCommunity,
  leaveCommunity,
  getUserCommunities,
  getCommunityMembers,
  isMember,
  createPost,
  getCommunityPosts,
} from "../services/communityService.js";
import { success, created } from "../utils/response.js";

export const createCommunityController = async (req, res, next) => {
  try {
    // Use authenticated user's ID
    const data = await createCommunity({
      ...req.body,
      created_by: req.user.uid,
    });
    created(res, data, "Community created");
  } catch (err) {
    next(err);
  }
};

export const getCommunityController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await getCommunity(id);
    success(res, data, "Community fetched");
  } catch (err) {
    next(err);
  }
};

export const listCommunitiesController = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, collegeId, search } = req.query;
    const data = await listCommunities({
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      collegeId,
      search,
    });
    success(res, data, "Communities fetched");
  } catch (err) {
    next(err);
  }
};

export const joinCommunityController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await joinCommunity(id, req.user.uid);
    success(res, data, data.alreadyMember ? "Already a member" : "Joined community");
  } catch (err) {
    next(err);
  }
};

export const leaveCommunityController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await leaveCommunity(id, req.user.uid);
    success(res, data, "Left community");
  } catch (err) {
    next(err);
  }
};

export const getUserCommunitiesController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const data = await getUserCommunities(userId);
    success(res, data, "User communities fetched");
  } catch (err) {
    next(err);
  }
};

export const getMyCommunitiesController = async (req, res, next) => {
  try {
    const data = await getUserCommunities(req.user.uid);
    success(res, data, "Your communities fetched");
  } catch (err) {
    next(err);
  }
};

export const getCommunityMembersController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 50 } = req.query;
    const data = await getCommunityMembers(id, {
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
    });
    success(res, data, "Community members fetched");
  } catch (err) {
    next(err);
  }
};

export const checkMembershipController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await isMember(id, req.user.uid);
    success(res, { isMember: data }, "Membership status fetched");
  } catch (err) {
    next(err);
  }
};

export const createPostController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Post content is required",
      });
    }
    
    const data = await createPost(id, req.user.uid, content);
    created(res, data, "Post created");
  } catch (err) {
    next(err);
  }
};

export const getCommunityPostsController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 20 } = req.query;
    const data = await getCommunityPosts(id, {
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
    });
    success(res, data, "Community posts fetched");
  } catch (err) {
    next(err);
  }
};
