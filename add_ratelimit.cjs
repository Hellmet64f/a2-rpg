const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const oldOpen = `app.post('/api/shop/open', async (req, res) => {
  try {`;

const newOpen = `const rateLimitMap = new Map();

app.post('/api/shop/open', async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const lastOpen = rateLimitMap.get(ip) || 0;
    if (Date.now() - lastOpen < 1000) {
       return res.status(429).json({ error: "Opening packs too fast!" });
    }
    rateLimitMap.set(ip, Date.now());
`;

code = code.replace(oldOpen, newOpen);
fs.writeFileSync('server.ts', code);
