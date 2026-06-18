const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dns = require("dns");
const path = require("path");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const userRoutes = require("./routes/userRoutes");
const fs = require("fs");
const protect = require("./middleware/authMiddleware");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.static(path.join(__dirname, "frontend")));console.log("UPLOAD PATH:", path.join(__dirname, "uploads"));
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });


app.get("/check", (req, res) => {
  res.send("working");
}); 
app.get("/check-image", (req, res) => {
  const p = path.join(__dirname, "uploads", "1781669497217.jpg");

  console.log("EXISTS:", fs.existsSync(p));
  console.log("PATH:", p);

  res.send("done");
});

app.get("/uploads/:name", (req, res) => {

    const filePath = path.join(
        __dirname,
        "uploads",
        req.params.name
    );

    console.log("SERVING:", filePath);

    res.sendFile(filePath);
});

app.get("/", (req, res) => {
  res.send("API Running...");
});

app.get("/api/private", protect, (req, res) => {
  res.json({
    message: "Protected Route Accessed",
    user: req.user,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
