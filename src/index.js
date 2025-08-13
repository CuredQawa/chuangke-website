import express from "express";
import router from "./router.js"

const app = express();

app.use("/", router);
app.use(express.static('public'));

const port = 3000

app.listen(port, function () {
    console.log(`Running on localhost:${port}`);
})