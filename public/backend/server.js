require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fs = require("fs");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const path = require("path");

const Property = require("./models/Property");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple admin token middleware (optional)
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || ""; // set in .env
function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) return next(); // if no token set, allow (dev)
  const token = req.headers["x-admin-token"];
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Connect to MongoDB
const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dreamland";
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB err:", err));

// ----- Admin APIs ----- //

// Get all properties
app.get("/admin/properties", requireAdmin, async (req, res) => {
  try {
    const list = await Property.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single property (for view)
app.get("/admin/properties/:id/view", requireAdmin, async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).send("Not found");
    // simple html view (or return json)
    res.send(`
      <h1>${prop.title}</h1>
      <p><strong>Owner:</strong> ${prop.owner || "—"}</p>
      <p><strong>Price:</strong> ${prop.price || "—"}</p>
      <p><strong>Status:</strong> ${prop.status}</p>
      <p>${prop.description || ""}</p>
    `);
  } catch (err) {
    res.status(500).send("Error");
  }
});

// Update property (status or other fields)
app.put("/admin/properties/:id", requireAdmin, async (req, res) => {
  try {
    const update = req.body;
    const prop = await Property.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!prop) return res.status(404).json({ message: "Not found" });
    res.json(prop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

// Delete property
app.delete("/admin/properties/:id", requireAdmin, async (req, res) => {
  try {
    const prop = await Property.findByIdAndDelete(req.params.id);
    if (!prop) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

// Export CSV
app.get("/admin/export/csv", requireAdmin, async (req, res) => {
  try {
    const data = await Property.find().lean();
    if (!data.length) return res.status(404).send("No data");

    const fields = ["_id", "owner", "title", "price", "status", "createdAt"];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    const filePath = path.join(__dirname, "exports");
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);
    const fileName = path.join(filePath, `properties_${Date.now()}.csv`);
    fs.writeFileSync(fileName, csv);

    res.download(fileName, err => {
      if (err) console.error("Download err:", err);
      // optionally delete file after download
      setTimeout(() => fs.unlink(fileName, ()=>{}), 60*1000);
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Export failed" });
  }
});

// Export PDF
app.get("/admin/export/pdf", requireAdmin, async (req, res) => {
  try {
    const data = await Property.find().lean();
    if (!data.length) return res.status(404).send("No data");

    const filePath = path.join(__dirname, "exports");
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);
    const fileName = path.join(filePath, `properties_${Date.now()}.pdf`);

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    doc.pipe(fs.createWriteStream(fileName));

    doc.fontSize(18).text("Property Listings", { underline: true });
    doc.moveDown();

    data.forEach((p, idx) => {
      doc.fontSize(12).text(`${idx + 1}. ${p.title}`);
      doc.fontSize(10).text(`Owner: ${p.owner || "—"} | Price: ${p.price || "—"} | Status: ${p.status || "—"}`);
      if (p.description) doc.text(`Description: ${p.description}`);
      doc.moveDown();
    });

    doc.end();

    // wait until file is finished writing
    doc.on("finish", () => {
      res.download(fileName, err => {
        if (err) console.error(err);
        setTimeout(() => fs.unlink(fileName, ()=>{}), 60*1000);
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "PDF export failed" });
  }
});

// Simple API to create property (for testing / admin create)
app.post("/admin/properties", requireAdmin, async (req, res) => {
  try {
    const prop = new Property(req.body);
    await prop.save();
    res.json(prop);
  } catch (err) {
    res.status(500).json({ message: "Create failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
