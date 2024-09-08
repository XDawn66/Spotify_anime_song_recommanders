const express = require("express");
const app = express();
const port = 5500;

//telling the express where to find my files
app.use(express.static("public"));

//telling the express where to find my files
app.use("/css", express.static(__dirname + "public/assets/css"));
app.use("/sass", express.static(__dirname + "public/assets/sass"));
app.use("/js", express.static(__dirname + "public/assets/js"));
app.use("/images", express.static(__dirname + "public/images"));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
