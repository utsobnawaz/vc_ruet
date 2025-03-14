const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("✅ Connected to MongoDB");
        app.listen(port, () => {
            console.log(`🚀 Server is running on port ${port}`);
        });
    })
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Define Mongoose Schema & Model
const fileSchema = new mongoose.Schema({
    filename: String,
    contentType: String,
    data: Buffer
});
const File = mongoose.model('File', fileSchema);

// Multer Configuration
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files allowed'), false);
        }
    }
});

app.get('/', async (req, res) => {
    res.json({ message: "This is Utsob from BS23" });
});


// API: Upload PDF File
app.post('/submit-form', upload.single('resume'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    try {
        const { originalname, mimetype, buffer } = req.file;
        const newFile = new File({ filename: originalname, contentType: mimetype, data: buffer });

        await newFile.save();
        console.log("✅ File Uploaded:", originalname);

        res.status(200).json({ success: true, message: 'File Uploaded Successfully', filename: originalname });
    } catch (err) {
        console.error('❌ Error saving file:', err);
        res.status(500).json({ success: false, message: 'Error saving file to MongoDB' });
    }
});

// API: Get List of Uploaded PDFs
app.get('/get-files', async (req, res) => {
    try {
        const files = await File.find({}, '_id filename');
        res.json({ success: true, files });
    } catch (err) {
        console.error("❌ Error fetching files:", err);
        res.status(500).json({ success: false, message: 'Error fetching files' });
    }
});

// API: Fetch a File by ID
app.get('/file/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        console.log("✅ File found in MongoDB:", file.filename);

        res.set({
            'Content-Type': file.contentType,
            'Content-Disposition': 'inline'
        });

        res.send(file.data.buffer);
    } catch (err) {
        console.error("❌ Error fetching file:", err);
        res.status(500).json({ success: false, message: 'Error fetching file' });
    }
});

// Export app for testing or use in other modules
module.exports = app;  // Changed from export default app to CommonJS
