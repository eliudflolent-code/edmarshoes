const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const STORE_FILE = path.join(__dirname, 'store.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

// Mfumo wa kupokea mafile ya picha halisi (Multer)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Kazi za kusoma na kuandika store.json
function readStore() {
    try {
        if (!fs.existsSync(STORE_FILE)) {
            return { products: [], settings: {} };
        }
        return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    } catch (e) {
        return { products: [], settings: {} };
    }
}

function writeStore(data) {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Route ya Login (Password: Edmar2026)
app.post('/api/admin/login', (req, res) => {
    if (req.body.password === 'Edmar2026') {
        return res.json({ success: true });
    }
    return res.status(401).json({ error: 'Password si sahihi!' });
});

// Route ya ku-upload Bidhaa Mpya na Picha Halisi
app.post('/api/products', upload.single('image'), (req, res) => {
    try {
        const { name, price, description } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Jina la kiatu linahitajika!' });
        }

        let imageUrl = '/uploads/default.jpg';
        if (req.file) {
            imageUrl = '/uploads/' + req.file.filename;
        }

        const data = readStore();
        const newProduct = {
            id: 'prod_' + Math.random().toString(36).substr(2, 9),
            name,
            price: price || "0",
            description: description || "",
            imageUrl,
            createdAt: new Date()
        };

        data.products.unshift(newProduct);
        writeStore(data);

        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Kupata bidhaa zote
app.get('/api/products', (req, res) => {
    const data = readStore();
    return res.json(data.products || []);
});

// Kufuta Bidhaa
app.delete('/api/products/:id', (req, res) => {
    const data = readStore();
    const productId = req.params.id;
    
    if (data.products) {
        data.products = data.products.filter(p => p.id !== productId);
        writeStore(data);
    }
    return res.json({ success: true });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server ipo LIVE port ${PORT} 🚀`));
