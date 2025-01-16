const express = require('express');

const app = express();
// const cors = require('cors');

// app.use((req, res, next) => {
//   // res.header('Access-Control-Allow-Origin', '*');
//   // res.header('Access-Control-Allow-Methods', 'GET,PATCH,POST,DELETE');
//   // res.header('Access-Control-Allow-Credentials', 'true');
//   res.setHeader('Access-Control-Allow-Credentials', true)
//   res.setHeader('Access-Control-Allow-Origin', '*')
//   next();
// });

// app.options('*', cors(corsOptions)); 

// const corsOptions = {
//     origin:'*', 
//     credentials:true,
//     // optionSuccessStatus:200
// }

// app.use(cors(corsOptions));

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = 3005;

const uri = 'mongodb+srv://stepanrad:stepanrad@movielist.y3mij.mongodb.net/?retryWrites=true&w=majority&appName=MovieList';
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (e) {
    console.error('Error connecting to MongoDB:', e);
  }
}

connectToDatabase();

const db = client.db('movies');
app.use(express.json());

app.get('/movies', async (req, res) => {
  try {
    const movies = await db.collection('movies').find().toArray();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/movies', async (req, res) => {
  const { 
    title,
    rating,
    year,
    actors,
    description,
    director,
    genre,
    time,
  } = req.body;

  const newMovie = {
    title,
    rating,
    year,
    actors,
    description,
    director,
    genre,
    time,
    favorite: false,
  };

  try {
    const result = await db.collection('movies').insertOne(newMovie);
    const newMovieWithId = { ...newMovie, _id: result.insertedId };
    res.status(201).json(newMovieWithId);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/movies/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const movie = await db.collection('movies').findOne({ _id: new ObjectId(id) });
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/movies/:id', async (req, res) => {
  const { id } = req.params;
  const updatedMovie = req.body;
  try {
    const result = await db.collection('movies').updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedMovie }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json({ message: 'Movie updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/movies/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.collection('movies').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});