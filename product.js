const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const MONGO_URI = "mongodb+srv://eliudflolent_db_user:EdmarPass2026@cluster0.wzwtfbe.mongodb.net/edmarshoes?retryWrites=true&w=majority";
mongoose.connect(MONGO_URI);

const Product = mongoose.model('Product', new mongoose.Schema({ name: String, price: String, imageUrl: String }));
const Setting = mongoose.model('Setting', new mongoose.Schema({ marquee: String, promo1: String, promo2: String, promo3: String }));

app.post('/api/admin/settings', async (req, res) => {
    await Setting.deleteMany({});
    const s = new Setting(req.body);
    await s.save();
    res.json({ success: true });
});

app.get('/api/settings', async (req, res) => {
    const s = await Setting.findOne();
    res.json(s || {});
});

app.post('/api/products', async (req, res) => {
    const p = new Product(req.body);
    await p.save();
    res.json({ success: true });
});

app.get('/api/products', async (req, res) => res.json(await Product.find()));
app.delete('/api/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

app.listen(10000);
