import AppError from '../app-error.js';

/**
 * 异步函数错误处理包装器
 * 注意：在Express 5中，异步函数会自动调用next()处理错误
 * 但为了代码的一致性和向后兼容性，我们仍然使用这个包装器
 * @param {Function} fn - 异步函数
 * @returns {Function} 包装后的函数
 */
const asyncHandler = (fn) => (req, res, next) => {
    // 在Express 5中，这行代码提供额外的错误处理保证
    // 即使异步函数抛出错误或拒绝Promise，也会确保调用next()
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;