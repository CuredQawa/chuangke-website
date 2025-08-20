const errorHandler = (err, req, res, next) => {
    // 处理 JSON 解析错误
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            message: "请求数据格式错误，请检查 JSON 格式是否正确"
        });
    }

    console.error(err);
    res.status(500).json({
        message: "服务器发生内部错误，请联系网站管理员",
    });
};

export default errorHandler;