require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session'); // Tumeongeza hii kwa ajili ya login

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. WEKA MIFUMO YA SESSION (KUMBUKUMBU YA LOGIN)
app.use(session({
    secret: 'edmar_secret_key_9988', // Siri ya kulinda session zako
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 600000 } // Login itatoka yenyewe admin akikaa dakika 10 bila kufanya kitu
}));

// 2. ULINZI (MIDDLEWARE): Inakagua kama mtu ameshajaza password kabla ya kuona admin.html
function kaguaLogin(req, res, next) {
    if (req.session && req.session.isAdmin) {
        return next(); // Amelogin vizuri, aendelee
    } else {
        res.redirect('/login.html'); // Haja-login, fukuza apelekwe login page
    }
}

// ROUTE YA KULINDA ADMIN PANEL
app.get('/admin.html', kaguaLogin, (req, res, next) => {
    next(); // Kama amepita kwenye kaguaLogin, basi aruhusiwe kusoma faili la admin.html
});

// Ruhusu mafile mengine ya folda ya public yasomeke yenyewe (Kama index.html na login.html)
app.use(express.static('public'));

// ---------------- DATABASE SCHEMAS ----------------
const Product = mongoose.model('Product', new mongoose.Schema({
    title: String, imageUrl: String, price: String, description: String, createdAt: { type: Date, default: Date.now }
}));
const Slider = mongoose.model('Slider', new mongoose.Schema({ imageUrl: String }));
const Settings = mongoose.model('Settings', new mongoose.Schema({ key: String, value: mongoose.Schema.Types.Mixed }));

// ---------------- API ZA LOGIN ----------------

// API ya Kupokea Password kutoka kwenye fomu ya login
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const PASSWORD_YA_ADMIN = "Edmar2026"; // << WEKA PASSWORD UNAYOTAKA HAPA KWA AJILI YA KULOGIN

    if (password === PASSWORD_YA_ADMIN) {
        req.session.isAdmin = true; // Tengeneza ruhusa ya kuingia
        res.redirect('/admin.html'); // Mpeleke admin kwenye dashboard
    } else {
        res.send(`
            <script>
                alert('Password Siyo Sahihi! Jaribu Tena.');
                window.location.href = '/login.html';
            </script>
        `);
    }
});

// API ya Logout (Kama admin akitaka kutoka mwenyewe)
app.get('/api/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

// ---------------- API NYINGINE ZOTE ZILINDE (ROUTE PROTECTION) ----------------
// Hii inazuia watu wasio na login kutumia zile fomu au kufuta vitu kupitia programu za nje
app.post('/api/products', kaguaLogin, async (req, res) => {
    try { const newProduct = new Product(req.body); await newProduct.save(); res.redirect('/admin.html'); } catch { res.status(500).send('Kosa'); }
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

// ---------------- CONNECT DATABASE & START ----------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Database ya EDMAR Imeunganishwa na Mfumo Umelindwa! 🔒🔥'))
  .catch(err => console.error('Shida ya Database:', err.message));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server inarun kwenye port ${PORT}`));