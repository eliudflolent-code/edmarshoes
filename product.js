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
const Setting = mongoose.model('Setting', new mongoose.Schema({ marquee: String, promo1: String, promo2: String, promo3: String, bgImage: String }));
const Slide = mongoose.model('Slide', new mongoose.Schema({ imageUrl: String }));

// API
app.get('/api/settings', async (req, res) => res.json(await Setting.findOne() || {}));
app.post('/api/admin/settings', async (req, res) => { await Setting.deleteMany({}); await new Setting(req.body).save(); res.json({success: true}); });
app.get('/api/slides', async (req, res) => res.json(await Slide.find()));
app.post('/api/slides', async (req, res) => { await new Slide(req.body).save(); res.json({success: true}); });
app.delete('/api/slides/:id', async (req, res) => { await Slide.findByIdAndDelete(req.params.id); res.json({success: true}); });
app.get('/api/products', async (req, res) => res.json(await Product.find()));
app.post('/api/products', async (req, res) => { await new Product(req.body).save(); res.json({success: true}); });
app.delete('/api/products/:id', async (req, res) => { await Product.findByIdAndDelete(req.params.id); res.json({success: true}); });

app.listen(10000);
