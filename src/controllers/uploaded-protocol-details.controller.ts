import { Request, Response } from "express";
import UploadedProtocolDetails from "../models/uploaded-protocol-details.schema";

export class UploadedProtocolDetailsController {
  static async list(req: Request, res: Response) {
    try {
      const filter: any = {};
      if (req.query.pi) filter.pi = req.query.pi;
      if (req.query.indication) filter.indication = req.query.indication;
      if (req.query.protocol_id) filter.protocol_id = req.query.protocol_id;
      if (req.query.is_updated !== undefined)
        filter.is_updated = req.query.is_updated === "true";
      if (req.query.enrollment_startDate)
        filter.enrollment_startDate = req.query.enrollment_startDate;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [total, items] = await Promise.all([
        UploadedProtocolDetails.countDocuments(filter),
        UploadedProtocolDetails.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
      ]);

      const response = await UploadedProtocolDetails.find();

      res.json({
        total,
        page,
        limit,
        items,
        response,
      });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to fetch protocol details", details: err });
    }
  }

  static async getProtocolIds(req: Request, res: Response) {
    const get = await UploadedProtocolDetails.find();
    const protocolIds = get.map((doc) => doc.protocol_id);
    res.status(200).json(protocolIds);
  }

  static async getIndication(req: Request, res: Response) {
    const protocalDetails = await UploadedProtocolDetails.find();
    const getIndication = protocalDetails.map((doc) => doc.indication);
    res.status(200).json(getIndication);
  }
}
