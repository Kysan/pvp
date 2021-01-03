
const express = require('express');
const path = require("path");

const app = express();
const port = 3000;

const staticFolderPath = path.join(__dirname, '../front-end/dist');
app.use('/', express.static(staticFolderPath));
console.log("static folder path: ", staticFolderPath);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})