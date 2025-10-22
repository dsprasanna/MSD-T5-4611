const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());
const filePath = './books.json';
function readBooks() {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading books file:", err);
    return [];
  }
}

function writeBooks(books) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(books, null, 2));
  } catch (err) {
    console.error("Error writing books file:", err);
  }
}
app.get('/books', (req, res) => {
  const books = readBooks();
  res.json(books);
});
app.get('/books/available', (req, res) => {
  const books = readBooks();
  const availableBooks = books.filter(book => book.available === true);
  res.json(availableBooks);
});
app.post('/books', (req, res) => {
  const books = readBooks();
  const { title, author, available } = req.body;

  if (!title || !author || available === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newId = books.length > 0 ? books[books.length - 1].id + 1 : 1;
  const newBook = { id: newId, title, author, available };
  books.push(newBook);

  writeBooks(books);
  res.status(201).json(newBook);
});

app.put('/books/:id', (req, res) => {
  const books = readBooks();
  const id = parseInt(req.params.id);
  const bookIndex = books.findIndex(b => b.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const { title, author, available } = req.body;

  if (title !== undefined) books[bookIndex].title = title;
  if (author !== undefined) books[bookIndex].author = author;
  if (available !== undefined) books[bookIndex].available = available;

  writeBooks(books);
  res.json(books[bookIndex]);
});

app.delete('/books/:id', (req, res) => {
  const books = readBooks();
  const id = parseInt(req.params.id);
  const bookIndex = books.findIndex(b => b.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const deletedBook = books.splice(bookIndex, 1)[0];
  writeBooks(books);
  res.json({ message: 'Book deleted', book: deletedBook });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
// GET /books/:id → get a single book by ID
app.get('/books/:id', (req, res) => {
  const books = readBooks();
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  res.json(book);
});
