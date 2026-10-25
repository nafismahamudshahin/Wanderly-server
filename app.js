import { MongoClient } from 'mongodb';
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
const users = db.collection("users");

app.get('/', (req, res) => {
    res.send({ message: "Server running.." })
})

app.listen(PORT, (req, res) => {
    console.log(`Server running on Port ${PORT}`);
})