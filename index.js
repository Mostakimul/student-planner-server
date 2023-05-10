const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
// const ObjectId = require('mongodb').ObjectId;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pzlyslo.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// function verifyJWT(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     res.status(401).send({ message: 'unauthorized access' });
//   }
//   const token = authHeader.split(' ')[1];
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
//     if (err) {
//       res.status(401).send({ message: 'unauthorized access' });
//     }
//     req.decoded = decoded;
//     next();
//   });
// }

async function run() {
  try {
    await client.connect();
    const database = client.db('studentPlanner');
    const usersCollection = database.collection('users');
    const classCollection = database.collection('classes');

    // login to mongo
    app.post('/login', async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const result = await usersCollection.findOne(query);
      res.json(result);
    });

    // Save user to mongo
    app.post('/register', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    // add class to mongo db
    app.post('/addClass', async (req, res) => {
      const myClass = req.body;
      const result = await classCollection.insertOne(myClass);
      res.json(result);
    });

    // get class by email
    app.get('/classes/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await classCollection.find(query).toArray();
      res.json(result);
    });

    // Delete a class
    app.delete('/class/:id', async (req, res) => {
      const classId = req.params.id;
      const query = { _id: new ObjectId(classId) };
      const result = await classCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', async (req, res) => {
  res.send('student planner server is running');
});

app.listen(port, () => console.log(`Student Planner running on ${port}`));
