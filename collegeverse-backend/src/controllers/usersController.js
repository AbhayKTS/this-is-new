import { listUsers, createUser, updateUser } from "../services/userService.js";
import { success, created } from "../utils/response.js";

export const getUsers = async (req, res, next) => {
  try {
    const email = req.query.email;
    const data = await listUsers(email);
    success(res, email ? data[0] ?? null : data, "users fetched");
  } catch (err) {
    next(err);
  }
};

export const postUser = async (req, res, next) => {
  try {
    const data = await createUser(req.validatedBody);
    created(res, data, "user created");
  } catch (err) {
    next(err);
  }
};

export const putUser = async (req, res, next) => {
  try {
    const { id } = req.validatedParams;
    const data = await updateUser(id, req.validatedBody);
    success(res, data, "user updated");
  } catch (err) {
    next(err);
  }
};
