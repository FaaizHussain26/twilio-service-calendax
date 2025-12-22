import { Request, Response } from "express";
import { outcomeLeadsService } from "../services/outcome-lead.service";

export class outcomeLeadsController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      // Validate that data exists
      if (!data || Object.keys(data).length === 0) {
        res.status(400).json({
          success: false,
          message: "No data provided",
        });
        return;
      }
      const auditInfo = {
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      };
      // Call service
      const result = await outcomeLeadsService.createLead(
        data,
        auditInfo as any
      );

      res.status(201).json({
        success: true,
        message: "Lead created successfully",
        data: result,
      });
    } catch (error) {
      console.error("Controller: Error creating lead:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const lead = await outcomeLeadsService.getLeadById(id as string);

      if (!lead) {
        res.status(404).json({
          success: false,
          message: "Lead not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      console.error("Controller: Error fetching lead:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
