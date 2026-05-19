const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

app.use(session({
    secret: 'edmar_super_secret_2026',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // Saa 24 login ihifadhiwe
}));

// Unganisha MongoDB
mongoose.connect(process.env.MONGO_URI)
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

// Admin Login Route
app.post('/api/admin/login', (req, res) => {
    if (req.body.password === 'Edmar2026') {
        req.session.isAdmin = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Password si sahihi!' });
    }
});

// Linda kurasa za Admin
const checkAdmin = (req, res, next) => {
    if (req.session.isAdmin) next();
    else res.status(401).send('Huruhusiwi kuingia hapa bila login!');
};

app.get('/api/admin/check', (req, res) => {
    if (req.session.isAdmin) res.json({ loggedIn: true });
    else res.json({ loggedIn: false });
});

app.get('/api/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

// --- API za Viatu (Products) ---
app.post('/api/products', checkAdmin, async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json({ success: true });
});

app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.delete('/api/products/:id', checkAdmin, async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// --- API za Muonekano (Design) ---
app.post('/api/design', checkAdmin, async (req, res) => {
    const { key, value } = req.body;
    if (key === 'slideshow') {
        await Design.findOneAndUpdate({ key }, { $push: { valueList: value } }, { upsert: true });
    } else {
        await Design.findOneAndUpdate({ key }, { value }, { upsert: true });
    }
    res.json({ success: true });
});

app.post('/api/design/slideshow/clear', checkAdmin, async (req, res) => {
    await Design.findOneAndUpdate({ key: 'slideshow' }, { valueList: [] }, { upsert: true });
    res.json({ success: true });
});

app.get('/api/design', async (req, res) => {
    const data = await Design.find();
    res.json(data);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server ipo Live kwenye port ${PORT} 🚀`));
