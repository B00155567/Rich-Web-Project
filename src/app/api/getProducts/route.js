export async function GET(req, res) {
    // Make a note we are on the api. This goes to the console.
    console.log("in the api page")
    const { MongoClient } = require('mongodb');
    console.log("DB_ADDRESS:", process.env.DB_ADDRESS); // Log the environment variable
    const url = process.env.DB_ADDRESS;
    const client = new MongoClient(url);
    const dbName = 'app'; // database name
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const collection = db.collection('products'); // collection name
    const findResult = await collection.find({}).toArray();
    console.log('Found documents =>', findResult);
    return Response.json(findResult)
    }
    