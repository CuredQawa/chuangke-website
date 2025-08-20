const errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        message: "服务器发生内部错误，请联系网站管理员",
    });
};

export default errorHandler;