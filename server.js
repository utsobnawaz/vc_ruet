const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.static('public'));

const mongoURI = 'mongodb://localhost:27017';
const dbName = 'mydatabase';
let db, filesCollection, client;

// Function to check MongoDB connection
const checkMongoDBConnection = async () => {
    if (client && client.topology && client.topology.isConnected()) {
        console.log('✅ MongoDB is connected');
    } else {
        console.log('❌ MongoDB is not connected');
    }
};

// Connect to MongoDB
MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(mongoClient => {
        client = mongoClient;
        db = client.db(dbName);
        filesCollection = db.collection('files');
        console.log('✅ Connected to MongoDB');
        setInterval(checkMongoDBConnection, 5000); // Check connection every 5 seconds
    })
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Multer configuration (store file in memory)
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

// File Upload Route
app.post('/submit-form', upload.single('resume'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    try {
        const { originalname, mimetype, buffer } = req.file;
        await filesCollection.insertOne({ filename: originalname, contentType: mimetype, data: buffer });
        console.log("✅ File Uploaded to MongoDB:", originalname);
        res.status(200).json({ success: true, message: 'File Uploaded Successfully', filename: originalname });
    } catch (err) {
        console.error('Error saving file to MongoDB:', err);
        res.status(500).json({ success: false, message: 'Error saving file to MongoDB' });
    }
});

// Get List of Uploaded PDFs
app.get('/get-files', async (req, res) => {
    try {
        // Fetching full file objects, including _id and filename
        const files = await filesCollection.find({}).toArray();

        // Map the files to only include the filename and _id for frontend
        const fileList = files.map(file => ({
            _id: file._id.toString(), // Convert ObjectId to string for frontend
            filename: file.filename
        }));

        res.json({ success: true, files: fileList });
    } catch (err) {
        console.error("❌ Error fetching files:", err);
        res.status(500).json({ success: false, message: 'Error fetching files' });
    }
});


app.get('/file/:id', async (req, res) => {
    try {
        console.log("🔍 Fetching file by ID:", req.params.id);

        const file = await filesCollection.findOne({ _id: new ObjectId(req.params.id) });

        if (!file) {
            console.log("❌ File not found:", req.params.id);
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        console.log("✅ File found in MongoDB:", file.filename);

        // Convert buffer data to a readable stream
        res.set({
            'Content-Type': file.contentType,
            'Content-Disposition': 'inline' // Forces the browser to open the file instead of downloading
        });

        res.send(file.data.buffer); // Send buffer properly
    } catch (err) {
        console.error("❌ Error fetching file:", err);
        res.status(500).json({ success: false, message: 'Error fetching file' });
    }
});

// Serve a file from MongoDB
// Serve a file from MongoDB for inline viewing
app.get('/file/:filename', async (req, res) => {
    try {
        console.log("🔍 Fetching file:", req.params.filename);

        const file = await filesCollection.findOne({ filename: req.params.filename });

        if (!file) {
            console.log("❌ File not found:", req.params.filename);
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        console.log("✅ File found in MongoDB:", file.filename);

        // Convert buffer data to a readable stream
        res.set({
            'Content-Type': file.contentType,
            'Content-Disposition': 'inline' // Forces the browser to open the file instead of downloading
        });

        res.send(file.data.buffer); // Send buffer properly
    } catch (err) {
        console.error("❌ Error fetching file:", err);
        res.status(500).json({ success: false, message: 'Error fetching file' });
    }
});




const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
