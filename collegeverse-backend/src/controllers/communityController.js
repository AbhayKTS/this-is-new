import {
  createCommunity,
  getCommunity,
  listCommunities,
  joinCommunity,
  leaveCommunity,
  getUserCommunities,
  getCommunityMembers,
  isMember,
} from "../services/communityService.js";
import { success, created } from "../utils/response.js";

export const createCommunityController = async (req, res, next) => {
  try {
    const data = await createCommunity(req.validatedBody);
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
    const { user_id } = req.validatedBody;
    const data = await joinCommunity(id, user_id);
    success(res, data, data.alreadyMember ? "Already a member" : "Joined community");
  } catch (err) {
    next(err);
  }
};

export const leaveCommunityController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id } = req.validatedBody;
    const data = await leaveCommunity(id, user_id);
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
    const { userId } = req.query;
    const data = await isMember(id, userId);
    success(res, { isMember: data }, "Membership status fetched");
  } catch (err) {
    next(err);
  }
};
