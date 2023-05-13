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
    const examCollection = database.collection('exams');
    const assignmentCollection = database.collection('assignments');
    const presentationCollection = database.collection('presentations');
    const busCollection = database.collection('busSchedule');

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

    // get single class
    app.get('/class/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classCollection.findOne(query);
      res.send(result);
    });

    // update class
    app.patch('/class/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedClass = req.body;

      const myClass = {
        $set: {
          subject: updatedClass.subject,
          professor: updatedClass.professor,
          schedule: updatedClass.schedule,
          room: updatedClass.room,
        },
      };

      const result = await classCollection.updateOne(filter, myClass, options);
      res.send(result);
    });

    // Delete a class
    app.delete('/class/:id', async (req, res) => {
      const classId = req.params.id;
      const query = { _id: new ObjectId(classId) };
      const result = await classCollection.deleteOne(query);
      res.json(result);
    });

    /**
     * Exam section
     */
    // add exam to mongo db
    app.post('/exam', async (req, res) => {
      const data = req.body;
      const result = await examCollection.insertOne(data);
      res.json(result);
    });

    // get exams by email
    app.get('/exams/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await examCollection.find(query).toArray();
      res.json(result);
    });

    // get single exam
    app.get('/exam/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await examCollection.findOne(query);
      res.send(result);
    });

    // update exam
    app.patch('/exam/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedExam = req.body;

      const myExam = {
        $set: {
          subject: updatedExam.subject,
          type: updatedExam.type,
          date: updatedExam.date,
          room: updatedExam.room,
          method: updatedExam.method,
        },
      };

      const result = await examCollection.updateOne(filter, myExam, options);
      res.send(result);
    });

    // Delete a exam
    app.delete('/exam/:id', async (req, res) => {
      const examId = req.params.id;
      const query = { _id: new ObjectId(examId) };
      const result = await examCollection.deleteOne(query);
      res.json(result);
    });

    /**
     * Assignment section
     */
    // add myAssignment to mongo db
    app.post('/assignment', async (req, res) => {
      const data = req.body;
      const result = await assignmentCollection.insertOne(data);
      res.json(result);
    });

    // get myAssignment by email
    app.get('/assignments/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await assignmentCollection.find(query).toArray();
      res.json(result);
    });

    // get myAssignment
    app.get('/assignment/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentCollection.findOne(query);
      res.send(result);
    });

    // update myAssignment
    app.patch('/assignment/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedAssignment = req.body;

      const myAssignment = {
        $set: {
          subject: updatedAssignment.subject,
          title: updatedAssignment.title,
          deadline: updatedAssignment.deadline,
          type: updatedAssignment.type,
        },
      };

      const result = await assignmentCollection.updateOne(
        filter,
        myAssignment,
        options,
      );
      res.send(result);
    });

    // Delete a assignment
    app.delete('/assignment/:id', async (req, res) => {
      const assignmentId = req.params.id;
      const query = { _id: new ObjectId(assignmentId) };
      const result = await assignmentCollection.deleteOne(query);
      res.json(result);
    });

    /**
     * Presentation section
     */
    // add presentation to mongo db
    app.post('/presentation', async (req, res) => {
      const data = req.body;
      const result = await presentationCollection.insertOne(data);
      res.json(result);
    });

    // get presentations by email
    app.get('/presentations/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await presentationCollection.find(query).toArray();
      res.json(result);
    });

    // get presentation
    app.get('/presentation/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await presentationCollection.findOne(query);
      res.send(result);
    });

    // update presentation
    app.patch('/presentation/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedPresentation = req.body;

      const myPresentation = {
        $set: {
          subject: updatedPresentation.subject,
          title: updatedPresentation.title,
          deadline: updatedPresentation.deadline,
          method: updatedPresentation.method,
        },
      };

      const result = await presentationCollection.updateOne(
        filter,
        myPresentation,
        options,
      );
      res.send(result);
    });

    // Delete a presentation
    app.delete('/presentation/:id', async (req, res) => {
      const presentationId = req.params.id;
      const query = { _id: new ObjectId(presentationId) };
      const result = await presentationCollection.deleteOne(query);
      res.json(result);
    });

    /**
     * Bus Schedule
     */
    // add bus schedule to mongo db
    app.post('/busSchedule', async (req, res) => {
      const data = req.body;
      const result = await busCollection.insertOne(data);
      res.json(result);
    });

    // get bus schedule
    app.get('/busSchedules/:email', async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const result = await busCollection.find(query).toArray();
      res.json(result);
    });

    // get buschedule
    app.get('/busSchedule/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await busCollection.findOne(query);
      res.send(result);
    });

    // update bus schedule
    app.patch('/busSchedule/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedSchedule = req.body;

      const myBusSchedule = {
        $set: {
          route: updatedSchedule.route,
          departureTime: updatedSchedule.departureTime,
          notify: updatedSchedule.notify,
        },
      };

      const result = await busCollection.updateOne(
        filter,
        myBusSchedule,
        options,
      );
      res.send(result);
    });

    // Delete a presentation
    app.delete('/busSchedule/:id', async (req, res) => {
      const busScheduleId = req.params.id;
      const query = { _id: new ObjectId(busScheduleId) };
      const result = await busCollection.deleteOne(query);
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
