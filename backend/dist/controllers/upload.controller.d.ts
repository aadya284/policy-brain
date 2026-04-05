import { Request, Response } from 'express';
export declare class UploadController {
    private upload;
    constructor();
    /**
     * Get multer upload middleware
     */
    getUploadMiddleware(): import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    /**
     * Handle document upload and processing
     */
    uploadDocument(req: Request, res: Response): Promise<void>;
    /**
     * Get upload status (for future implementation)
     */
    getUploadStatus(req: Request, res: Response): Promise<void>;
}
export declare const uploadController: UploadController;
