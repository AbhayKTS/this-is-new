import { uploadCertificate, updateCertificateStatus, listCertificates } from "../services/certificateService.js";
import { created, success } from "../utils/response.js";

export const createCertificateController = async (req, res, next) => {
  try {
    const data = await uploadCertificate(req.validatedBody);
    created(res, data, "certificate uploaded");
  } catch (err) {
    next(err);
  }
};

export const verifyCertificateController = async (req, res, next) => {
  try {
    const { id } = req.validatedParams;
    const data = await updateCertificateStatus(id, req.validatedBody);
    success(res, data, "certificate status updated");
  } catch (err) {
    next(err);
  }
};

export const listCertificatesController = async (req, res, next) => {
  try {
    const data = await listCertificates(req.query.user_id);
    success(res, data, "certificates fetched");
  } catch (err) {
    next(err);
  }
};
