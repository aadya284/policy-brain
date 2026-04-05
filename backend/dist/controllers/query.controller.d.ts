import { Request, Response } from 'express';
export declare class QueryController {
    /**
     * Handle natural language queries
     */
    queryDocuments(req: Request, res: Response): Promise<void>;
    /**
     * Get query history (for future implementation)
     */
    getQueryHistory(req: Request, res: Response): Promise<void>;
    /**
     * Get system status and statistics
     */
    getSystemStatus(req: Request, res: Response): Promise<void>;
}
export declare const queryController: QueryController;
