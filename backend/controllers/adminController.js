import tryCatch from "../middlewares/tryCatch.js";

export const adminControlller = tryCatch(async(req, res) => {
    return res.json({message: "Hello Admin"});
})