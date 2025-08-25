import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';

// Connect to MongoDB
mongoose.connect('mongodb+srv://sabiha1fashon:o0nuYkGjBIadDtgm@cluster0.hjr4gzg.mongodb.net/sabidb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Define Order Schema
const orderSchema = new mongoose.Schema({
    name: String,
    phone: String,
    address: String,
    email: { type: String, required: false },
    status: {
        type: String,
        enum: ['init', 'confirmed via phone', 'confirmed', 'canceled', 'pending', 'delivered'],
        default: 'init',
        required: true
    }
});

// Order Model
const Order = mongoose.model('Order', orderSchema);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Create new order
app.post('/api/order', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json({ message: 'Order created successfully!', order });
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(400).json({ error: 'Error creating order!' });
    }
});

// Get all orders
app.get('/', async (req, res) => {
    try {

        res.status(200).json("Server is running");
    } catch (err) { 
        res.status(400).json({ error: 'Error fetching orders!' });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        if (orders.length === 0) {
            return res.status(200).json({ message: 'No orders found!' });
        }
        res.status(200).json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(400).json({ error: 'Error fetching orders!' });
    }
});

// Get a single order by ID
app.get('/api/order/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found!' });
        }
        res.status(200).json(order);
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(400).json({ error: 'Error fetching order!' });
    }
});

// Update order status
app.put('/api/order/:id/status', async (req, res) => {
    const { status } = req.body;
    const allowedStatus = ['init', 'confirmed via phone', 'confirmed', 'canceled', 'pending', 'delivered'];

    if (!allowedStatus.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value!' });
    }

    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ error: 'Order not found!' });
        }
        res.status(200).json({ message: 'Status updated successfully!', order });
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(400).json({ error: 'Error updating status!' });
    }
});

// Delete order
app.delete('/api/order/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found!' });
        }
        res.status(200).json({ message: 'Order deleted successfully!' });
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(400).json({ error: 'Error deleting order!' });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
