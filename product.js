const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

// LINK YAKO HALISI YA MONGODB (Imesafishwa na kuwekewa jina la db: edmarshoes)
const MONGO_URI = "mongodb+srv://eliudflolent_db_user:yMGkdJQ6FQfnrKdI@cluster0.wzwtfbe.mongodb.net/edmarshoes?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log("Database ya MongoDB ya EDMAR Imeunganishwa! 🔥"))
    .catch(err => console.error("Shida ya DB:", err));

// Mfumo wa Bidhaa kule MongoDB
const Product = mongoose.model('Product', new mongoose.Schema({
    name: String,
    price: String,
    description: String,
    imageUrl: String,
    createdAt: { type: Date, default: Date.now }
}));

// Route ya Login (Password: Edmar2026)
app.post('/api/admin/login', (req, res) => {
    if (req.body.password === 'Edmar2026') {
        return res.json({ success: true });
    }
    return res.status(401).json({ error: 'Password si sahihi!' });
});

// Route ya kuongeza Bidhaa kwa kutumia LINK ya Postimages (JSON)
app.post('/api/products', async (req, res) => {
    try {
        const { name, price, description, imageUrl } = req.body;
        if (!name || !imageUrl) {
            return res.status(400).json({ error: 'Jina la kiatu na Link ya Picha vinahitajika!' });
        }

        const newProduct = new Product({ name, price, description, imageUrl });
        await newProduct.save();
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Route ya kupata bidhaa zote kutoka MongoDB
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        return res.json(products);
    } catch (err) {
        return res.status(500).json([]);
    }
});

// Route ya kufuta bidhaa kule MongoDB
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server ya MongoDB ipo LIVE port ${PORT} 🚀`));
