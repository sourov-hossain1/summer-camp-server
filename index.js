const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middlewire
app.use(cors());
app.use(express.json());

const verifyJwt = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorized access' });
    }
    const token = authorization.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })
}


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


        const popularCollection = client.db("summerDB").collection("popular");
        const classesCollection = client.db("summerDB").collection("classes");
        const cartsCollection = client.db("summerDB").collection("carts");
        const usersCollection = client.db("summerDB").collection("users");
        const addsCollection = client.db("summerDB").collection("adds");
        const instructorsCollection = client.db("summerDB").collection("instructor");
        const popinsCollection = client.db("summerDB").collection("popins");


        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

            res.send({ token })
        })

        // popular api
        app.get('/popular', async (req, res) => {
            const result = await popularCollection.find().toArray();
            res.send(result);
        });

        // calsses api
        app.get('/classes', async (req, res) => {
            const result = await classesCollection.find().toArray();
            res.send(result);
        });
        app.get('/carts', async (req, res) => {
            const result = await cartsCollection.find().toArray();
            res.send(result);
        });

        // class cart collection
        app.get('/carts', verifyJwt, async (req, res) => {
            const email = req.query.email;
            if (!email) {
                res.send([]);
            }

            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ error: true, message: 'forbidden access' })
            }

            const query = { email: email };
            const result = await cartsCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/carts', async (req, res) => {
            const items = req.body;
            const result = await cartsCollection.insertOne(items);
            res.send(result);
        })

        // users post api
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists' })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.get('/users/admin/:email', verifyJwt, async(req, res) => {
            const email = req.params.email;

            if(req.decoded.email !== email){
                res.send({admin: false})
            }

            const query = {email: email}
            const user = await usersCollection.findOne(query);
            const result = { admin: user?.role === 'admin' }
            res.send(result)
        })

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'admin'
                },
            };

            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        })



        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await cartsCollection.deleteOne(query);
            res.send(result);
        })

        // add item post
        app.post('/adds', async (req, res) => {
            const items = req.body;
            const result = await addsCollection.insertOne(items);
            res.send(result);
        })

        app.get('/adds', async (req, res) => {
            const result = await addsCollection.find().toArray();
            res.send(result);
        });


        // instructor data
        app.get('/instructor', async (req, res) => {
            const result = await instructorsCollection.find().toArray();
            res.send(result);
        });

        app.get('/popins', async (req, res) => {
            const result = await popinsCollection.find().toArray();
            res.send(result);
        });

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


