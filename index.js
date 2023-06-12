const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middlewire
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w2ynlfu.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        const popularCollection = client.db("summerDB").collection("popular");
        const classesCollection = client.db("summerDB").collection("classes");
        const cartsCollection = client.db("summerDB").collection("carts");
        const usersCollection = client.db("summerDB").collection("users");

        // popular api
        app.get('/popular', async(req, res) => {
            const result = await popularCollection.find().toArray();
            res.send(result);
        });

        // calsses api
        app.get('/classes', async(req, res) => {
            const result = await classesCollection.find().toArray();
            res.send(result);
        });

        // class cart collection
        app.get('/carts', async(req, res) =>{
            // const email = req.query.email;
            // console.log(email)
            // if(!email){
            //     res.send([]);
            // }
            // const query = {email: email};
            const result = await cartsCollection.find().toArray();
            res.send(result);
        })

       app.post('/carts', async(req, res) =>{
        const items = req.body;
        const result = await cartsCollection.insertOne(items);
        res.send(result);
       })

        // users post api
        app.post('/users', async(req, res) =>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
           })


       

    app.delete('/carts/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await cartsCollection.deleteOne(query);
        res.send(result);
    })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('summer camp is running')
})

app.listen(port, () => {
    console.log(`Summer is running on port ${port}`)
})


