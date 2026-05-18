require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'edmar_secret_key_9988',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 600000 }
}));

function kaguaLogin(req, res, next) {
    if (req.session && req.session.isAdmin) return next();
    res.redirect('/login.html');
}

app.get('/admin.html', kaguaLogin, (req, res, next) => { next(); });
app.use(express.static('public'));

const Product = mongoose.model('Product', new mongoose.Schema({
    title: String, imageUrl: String, price: String, description: String, createdAt: { type: Date, default: Date.now }
}));
const Slider = mongoose.model('Slider', new mongoose.Schema({ imageUrl: String }));
const Settings = mongoose.model('Settings', new mongoose.Schema({ key: String, value: mongoose.Schema.Types.Mixed }));

app.post('/api/admin/login', (req, res) => {
    if (req.body.password === "Edmar2026") {
        req.session.isAdmin = true;
        res.redirect('/admin.html');
    } else {
        res.send("<script>alert('Password Siyo Sahihi!'); window.location.href='/login.html';</script>");
    }
});

app.post('/api/products', kaguaLogin, async (req, res) => {
    const newProduct = new Product(req.body); await newProduct.save(); res.redirect('/admin.html');
});
app.delete('/api/products/:id', kaguaLogin, async (req, res) => {
    await Product.findByIdAndDelete(req.params.id); res.json({ success: true });
});
app.get('/api/products', async (req, res) => { res.json(await Product.find().sort({ createdAt: -1 }) || []); });

app.post('/api/slider', kaguaLogin, async (req, res) => {
    const newSlide = new Slider(req.body); await newSlide.save(); res.redirect('/admin.html');
});
app.delete('/api/slider/:id', kaguaLogin, async (req, res) => {
    await Slider.findByIdAndDelete(req.params.id); res.json({ success: true });
});
app.get('/api/slider', async (req, res) => { res.json(await Slider.find() || []); });

app.post('/api/settings', kaguaLogin, async (req, res) => {
    await Settings.findOneAndUpdate({ key: req.body.key }, { value: req.body.value }, { upsert: true }); res.redirect('/admin.html');
});
app.delete('/api/settings/:key', kaguaLogin, async (req, res) => {
    await Settings.findOneAndDelete({ key: req.params.key }); res.json({ success: true });
});
app.get('/api/settings', async (req, res) => {
    const s = await Settings.find(); const map = {}; s.forEach(x => map[x.key] = x.value); res.json(map);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Database ya EDMAR Imeunganishwa Kikamilifu! 🔒🔥'))
  .catch(err => console.error('Shida ya Database:', err.message));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server kwenye port ${PORT}`));
