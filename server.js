const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('./helpers/uuid');

const PORT = process.env.PORT || 3001;

const app = express();

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

// GET /notes should return the notes.html file.
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, './public/notes.html'));
});

// GET /api/notes should read the db.json file and return all saved notes as JSON.
app.get('/api/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './db/db.json'));
});

// POST /api/notes should receive a new note to save on the request body, add it to the db.json file, 
// and then return the new note to the client. You'll need to find a way to give each note a unique id when saved.
app.post('/api/notes', (req, res) => {
  // Log that a POST request was received
  console.info(`${req.method} request received to add a note`);

  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    // Variable for the object we will save
    const newNote = {
        title,
        text,
        id: uuid()
    };

    // Obtain existing reviews
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
          console.error(err);
      } else {
          // Convert string into JSON object
          const parsedNotes = JSON.parse(data);
    
          // Add a new review
          parsedNotes.push(newNote);
    
          // Write updated reviews back to the file
          fs.writeFile(
              './db/db.json',
              JSON.stringify(parsedNotes, null, 4),
              (writeErr) =>
                writeErr
                  ? console.error(writeErr)
                  : console.info('Successfully updated notes!')
            );
      }
    });

    const response = {
        status: 'success',
        body: newNote,
    };
  
    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json('Error in posting note');
  }
});

  // DELETE /api/notes/:id should receive a query parameter containing the id of a note to delete.
  app.delete('/api/notes/:id', (req, res) => {
    // Obtain existing reviews
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json('Error in deleting note');
      } else {
        // exclude note if it's id matches the parameter
        const filteredNotes = JSON.parse(data).filter(note => note.id !== req.params.id);
        // write back to the database the excluded note
        fs.writeFile('./db/db.json', JSON.stringify(filteredNotes, null, 4),
          (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info('Successfully updated notes!')
        );
        const response = {
          status: 'success',
          body: 'note id ' + req.params.id + ' deleted',
        };
    
        console.log(response);
        res.status(201).json(response);
      }
    });
  });

// GET * should return the index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Note Taker listening at http://localhost:${PORT}`);
});
