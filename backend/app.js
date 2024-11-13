const express = require('express');
const QRCode = require('qrcode');
const qrTerminal = require('qrcode-terminal');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken'); 
const CORS = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(CORS());
const SECRET_KEY = process.env.SECRET_KEY; 

app.use(bodyParser.json());

const transactions = [];

const tokens = [
    { id:'1', name: 'BNB', symbol: 'BNB', balance: 1.1131 },
    { id:'2', name: 'Bitcoin', symbol: 'BTC', balance: 0.0999 },
    { id:'3', name: 'DragonSlayer', symbol: 'DSL', balance: 0 },
    { id:'4', name: 'USDT', symbol: 'USDT', balance: 10.00 },
    { id:'5', name: 'Tether USD', symbol: 'USDT', balance: 100.00 },
];

function generateRandomAmount(minAmount, maxAmount) {
    return parseFloat((Math.random() * (maxAmount - minAmount) + minAmount).toFixed(2));
}

function generateTransactionId() {
    return uuidv4();
}

function generateRandomTransaction() {
    const price = generateRandomAmount(0.50, 300);
    const transactionId = generateTransactionId();
    return { price, transactionId };
}

const fetchTokenData = async () => {
    try {
        const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
            method: 'GET',
            headers: { 'X-CMC_PRO_API_KEY': '2b8cd9bc-0f3c-4b7c-9962-b0eee93b7cd7' }
        });

        const data = await response.json();
        const prices = data.data.reduce((acc, token) => {
            acc[token.symbol] = {
                idt: token.id,
                price: token.quote.USD.price,
                percent_change_1h: token.quote.USD.percent_change_1h 
            };
            return acc;
        }, {});

        return prices;
    } catch (error) {
        console.error("Error fetching token prices:", error);
        throw new Error("Error fetching token prices");
    }
};


app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    
    if (username === 'User' && password === '1234') {
     
       
        const token = jwt.sign({ username }, process.env.SECRET_KEY, { expiresIn: '1h' });
       
        return res.status(200).json({ token });
    } else {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
});


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401); 

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403); 
        req.user = user;
        next(); 
    });
};


app.get('/generate-qr', authenticateToken, async (req, res) => {
    console.log('######################################### QR CODE #########################################');

    try {
        const transaction = generateRandomTransaction();

        const dataToQr = {
            transactionId: transaction.transactionId,
            amount: transaction.price.toFixed(2),
        };

        const qrCode = await QRCode.toDataURL(JSON.stringify(dataToQr));

        qrTerminal.generate(JSON.stringify(dataToQr), { small: true }, (qrcode) => {
            console.log(qrcode);
        });

        const responseType = req.query.type;

        if (responseType === 'json') {
            res.status(200).json(dataToQr);
        } else {
            res.status(200).send(`
                <html>
                    <body>
                        <h1>Código QR Generado</h1>
                        <p>Transaction ID: ${transaction.transactionId}</p>
                        <p>Monto a pagar: $${transaction.price.toFixed(2)}</p>
                        <img src="${qrCode}" alt="QR Code" />
                    </body>
                </html>
            `);
        }
    } catch (err) {
        console.error('Error generating QR code:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
    console.log('###########################################################################################');
});



// Ruta POST para procesar el pago
app.post('/process-payment', authenticateToken, async (req, res) => {
    const { transactionId, amount, crypto } = req.body;

    // Encontrar el token seleccionado
    const tokenToUpdate = tokens.find(token => token.symbol === crypto);

    console.log('se encontro el token', tokenToUpdate)

    // Responder con el nuevo balance actualizado del token
    res.json({ message: 'Pago exitoso' });
});




app.post('/save-transaction', authenticateToken, (req, res) => {
    const { transactionId, date, amount, crypto } = req.body;

    // Crear la transacción
    const transaction = {
        id: transactionId,
        amount,
        date: date || new Date().toISOString(),
        crypto,
    };

    // Guardar la transacción en la lista
    transactions.push(transaction);

    res.status(201).json({ message: 'Transacción guardada exitosamente', transaction });
});



app.get('/transactions', authenticateToken, (req, res) => {
    res.json(transactions);
});



app.get('/tokens', authenticateToken, async (req, res) => {
    try {
        const prices = await fetchTokenData();

        // Calcular el balance total en dólares
        let totalBalanceInUSD = 0;

        const enrichedTokens = tokens.map(token => {
            const priceInUSD = prices[token.symbol]?.price || 0;
            const balanceInUSD = priceInUSD * token.balance;

            totalBalanceInUSD += balanceInUSD;

            return {
                ...token,
                ids: prices[token.symbol]?.idt,
                price: priceInUSD,
                percentChange: prices[token.symbol]?.percent_change_1h || 0,
                balanceInUSD
            };
        });

        res.json({ enrichedTokens, totalBalanceInUSD });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.listen(port, () => {
    console.log('Server running on port... ' + port);
});
