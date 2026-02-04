import { Router } from "express";
import { getUsers, postUser, putUser } from "../controllers/usersController.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { createUserSchema, updateUserSchema, userIdParamSchema } from "../validators/userSchemas.js";

const router = Router();

router.get("/", getUsers);
router.post("/", validateBody(createUserSchema), postUser);
router.put("/:id", validateParams(userIdParamSchema), validateBody(updateUserSchema), putUser);

export default router;
