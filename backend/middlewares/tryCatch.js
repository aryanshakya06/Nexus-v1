const tryCatch = (handler) => {
    return async(req, res, next) => {
        try {
            await handler(req, res, next);
        } catch(err) {
            res.status(500).json({ success: false, message: err.message, error: "Middleware Error"});
        }
    }
}

export default tryCatch;