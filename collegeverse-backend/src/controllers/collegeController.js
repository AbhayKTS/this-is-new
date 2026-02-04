import {
  getCollege,
  listColleges,
  getCollegeRatings,
  submitCollegeRating,
  compareColleges,
  getTrendingColleges,
  searchColleges,
} from "../services/collegeService.js";
import { success, created } from "../utils/response.js";

export const getCollegeController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await getCollege(id);
    success(res, data, "College fetched");
  } catch (err) {
    next(err);
  }
};

export const listCollegesController = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, search, location, type, sortBy } = req.query;
    const data = await listColleges({
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      search,
      location,
      type,
      sortBy,
    });
    success(res, data, "Colleges fetched");
  } catch (err) {
    next(err);
  }
};

export const getCollegeRatingsController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await getCollegeRatings(id);
    success(res, data, "College ratings fetched");
  } catch (err) {
    next(err);
  }
};

export const submitCollegeRatingController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await submitCollegeRating({ ...req.validatedBody, college_id: id });
    created(res, data, "Rating submitted");
  } catch (err) {
    next(err);
  }
};

export const compareCollegesController = async (req, res, next) => {
  try {
    const { ids } = req.query;
    const collegeIds = ids.split(",").map((id) => id.trim());
    const data = await compareColleges(collegeIds);
    success(res, data, "Comparison generated");
  } catch (err) {
    next(err);
  }
};

export const getTrendingCollegesController = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const data = await getTrendingColleges(parseInt(limit, 10));
    success(res, data, "Trending colleges fetched");
  } catch (err) {
    next(err);
  }
};

export const searchCollegesController = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;
    const data = await searchColleges(q, parseInt(limit, 10));
    success(res, data, "Search results fetched");
  } catch (err) {
    next(err);
  }
};
