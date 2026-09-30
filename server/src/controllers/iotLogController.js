import { getIotLogs } from "../services/iotLogService.js";
import { handleError } from "../utils/errorFormatter.js";

export const GetIotLogs = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;

    const result = await getIotLogs({ limit, offset });

    if (!result.success) {
      throw { status: 500, message: result.error };
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error) {
    return handleError(res, error, "GET /api/logs");
  }
};
