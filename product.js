const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

// WEKA LINK YAKO HALISI YA MONGODB HAPA ILI ISITEGEMEE RENDER ENVIRONMENT VARIABLES
const MONGO_URI = "mongodb+srv://eliudflolent_db_user:yMGkdJQ6FQfnrKdI@cluster0.wzwtfbe.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("Database ya EDMAR Imeunganishwa Kikamilifu! 🔥"))
    .catch(err => console.error("Shida ya DB:", err));

// Mfumo wa Database (Schemas)
const ProductSchema = new mongoose.Schema({
    name: String, price: String, description: String, imageUrl: String
});

const DesignSchema = new mongoose.Schema({
    key: { type: String, unique: true },
    value: String,
    valueList: [String]
});

const Product = mongoose.model('Product', ProductSchema);
const Design = mongoose.model('Design', DesignSchema);

app.post('/api/admin/login', (req, res) => {
    if (req.body.password === 'Edmar2026') {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Password si sahihi!' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json([]);
    }
});

app.delete('/api/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

app.post('/api/design', async (req, res) => {
    try {
        const { key, value } = req.body;
        if (key === 'slideshow') {
            await Design.findOneAndUpdate({ key }, { $push: { valueList: value } }, { upsert: true });
        } else {
            await Design.findOneAndUpdate({ key }, { value }, { upsert: true });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/design/slideshow/clear', async (req, res) => {
    await Design.findOneAndUpdate({ key: 'slideshow' }, { valueList: [] }, { upsert: true });
    res.json({ success: true });
});

app.get('/api/design', async (req, res) => {
    const data = await Design.find();
    res.json(data);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server ipo Live kwenye port ${PORT} 🚀`));
