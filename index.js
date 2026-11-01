import { MongoClient, ObjectId } from 'mongodb';
import cors from "cors";
import express from "express";
import 'dotenv/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const app = express()
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

// connect mongo db:

const client = new MongoClient(process.env.DB_URL);

export async function connectToMongoDb() {
    try {
        await client.connect();
        console.log("You Successfully connected to mongoDB");
        return client
    } catch (error) {
        console.log(error);
    }
}

const connedtedWithDb = await connectToMongoDb();
const db = connedtedWithDb.db("wanderlyDb");
const destinations = db.collection("destinations");
const booking = db.collection("booking");

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(404).send({ message: "unauthorized" })
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        res.status(404).send({ message: "Unauthorized" });
    }
    try {
        const JWKS = createRemoteJWKSet(new URL(`${process.env.FRONTEND_URL}/api/auth/jwks`));
        const { payload } = await jwtVerify(token, JWKS);
        console.log(payload)
        next()
    } catch (error) {
        res.status(500).send({ message: "Server Error." })
    }
}

app.get('/', (req, res) => {
    res.send({ message: "Server running.." })
})

app.get("/destination", async (req, res) => {
    const allDestination = await destinations.find().toArray();
    res.send(allDestination);
})

app.get('/destination/:id', verifyToken, async (req, res) => {
    const id = req.params.id
    const getSingleDestination = await destinations.findOne({ _id: new ObjectId(id) })
    res.send(getSingleDestination)
})

app.post("/destination", verifyToken, async (req, res) => {
    const { name, country, category, price, duration, departureDate, image, description } = req.body;
    const result = await destinations.insertOne({ name, country, category, price, duration, departureDate, image, description });
    res.send({ success: true, result })
})

app.patch('/destination/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const udatedDestination = req.body;
    const result = await destinations.updateOne({ _id: new ObjectId(id) }, { $set: udatedDestination })
    res.send(result);
})

app.delete("/destination/:id", verifyToken, async (req, res) => {
    const id = req.params.id;
    const iNeedToDeleteThisItem = destinations.deleteOne({ _id: new ObjectId(id) });
    res.send(iNeedToDeleteThisItem);
})

// my booking:
app.get("/booking/:email", verifyToken, async (req, res) => {
    const email = req.params.email;
    try {
        const getAllBookingData = await booking.find({ email: email }).toArray();
        res.json(getAllBookingData);
    } catch (error) {
        res.status(500).send({ success: false, message: "Could not load bookings." });
    }
})
app.post("/booking", verifyToken, async (req, res) => {
    const bookingData = req.body;
    const result = await booking.insertOne(bookingData);

    res.send({ success: true, result })
})
app.delete("/booking/:id", verifyToken, async (req, res) => {
    try {
        const result = await booking.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
            return res.status(404).send({ success: false, message: "Booking not found." });
        }
        res.send({ success: true, result });
    } catch (error) {
        res.status(400).send({ success: false, message: "Invalid booking id." });
    }
})
app.listen(PORT, (req, res) => {
    console.log(`Server running on Port ${PORT}`);
})

export default app;


