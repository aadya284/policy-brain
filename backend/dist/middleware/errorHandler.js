export const errorHandler = (error, req, res, next) => {
    console.error('Error occurred:', error);
    // Handle multer errors
    if (error.name === 'MulterError') {
        let message = 'File upload error';
        let code = 'UPLOAD_ERROR';
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                message = 'File size too large. Maximum size is 10MB.';
                code = 'FILE_TOO_LARGE';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'Unexpected file field.';
                code = 'INVALID_FILE_FIELD';
                break;
        }
        const apiError = {
            message,
            code,
        };
        res.status(400).json(apiError);
        return;
    }
    // Handle validation errors
    if (error.name === 'ValidationError') {
        const apiError = {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.message,
        };
        res.status(400).json(apiError);
        return;
    }
    // Handle custom API errors
    if (error.message && typeof error.code === 'string') {
        const apiError = {
            message: error.message,
            code: error.code,
        };
        res.status(400).json(apiError);
        return;
    }
    // Default error response
    const apiError = {
        message: process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : error.message,
        code: 'INTERNAL_ERROR',
    };
    res.status(500).json(apiError);
};
export const notFoundHandler = (req, res) => {
    const apiError = {
        message: `Route ${req.originalUrl} not found`,
        code: 'NOT_FOUND',
    };
    res.status(404).json(apiError);
};
