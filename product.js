const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

// LINK YAKO SAHIHI YA MONGODB KUTOKANA NA DATA ULIZOTUMA
const MONGO_URI = "mongodb+srv://eliudflolent_db_user:yMGkdJQ6FQfnrKdI@cluster0.wzwtfbe.mongodb.net/edmarshoes?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log("Database ya EDMAR Imeunganishwa Kikamilifu! 🔥"))
    .catch(err => console.error("Shida ya DB:", err));

// Mfumo wa Bidhaa (Schema)
const Product = mongoose.model('Product', new mongoose.Schema({
    name: String,
    price: String,
    description: String,
    imageUrl: String
}));

// Route ya Login
app.post('/api/admin/login', (req, res) => {
    if (req.body.password === 'Edmar2026') {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Password si sahihi!' });
    }
});

// Route ya Kupokea Bidhaa Mpya (Sasa inapokea JSON safi bila kukwama)
app.post('/api/products', async (req, res) => {
    try {
        const { name, price, description, imageUrl } = req.body;
        if (!name || !imageUrl) {
            return res.status(400).json({ error: 'Jaza Jina na Link ya Picha!' });
        }
        const newProduct = new Product({ name, price, description, imageUrl });
        await newProduct.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/products', async (req, res) => {
    const products = await Product.find().sort({ _id: -1 });
    res.json(products);
});

app.delete('/api/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server ya EDMAR ipo LIVE kwenye port ${PORT} 🚀`));
