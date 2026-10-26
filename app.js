import { MongoClient, ObjectId } from 'mongodb';
import cors from "cors";
import express from "express";
import 'dotenv/config';

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

app.get('/', (req, res) => {
    res.send({ message: "Server running.." })
})

app.get("/destination", async (req, res) => {
    const allDestination = await destinations.find().toArray();
    res.send(allDestination);
})

app.get('/destination/:id', async (req, res) => {
    const id = req.params.id
    const getSingleDestination = await destinations.findOne({ _id: new ObjectId(id) })
    res.send(getSingleDestination)
})

app.post("/destination", async (req, res) => {
    const { name, country, category, price, duration, departureDate, image, description } = req.body;
    const result = await destinations.insertOne({ name, country, category, price, duration, departureDate, image, description });
    res.send({ success: true, result })
})


app.listen(PORT, (req, res) => {
    console.log(`Server running on Port ${PORT}`);
})