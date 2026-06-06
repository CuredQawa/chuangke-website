/**
 * ID 参数校验中间件
 * 确保 req.params.id 为正整数，否则返回 400
 */
export function validateId(req, res, next) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: '无效的 ID' });
    }
    req.params.id = id;
    next();
}
