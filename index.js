require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')
const path = require('path')

const app = express()

app.use(express.static('build'))
app.use(cors())
app.use(express.json())

morgan.token('body', (req) => req.method === 'POST' ? JSON.stringify(req.body) : '')
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

//   let contacts = [
//   { id: 1, name: 'Arto Hellas', number: '040-123456' },
//   { id: 2, name: 'Ada Lovelace', number: '39-44-5323523' },
//   { id: 3, name: 'Dan Abramov', number: '12-43-234345' },
//   { id: 4, name: 'Mary Poppendieck', number: '39-23-6423122' }
// ]

app.get('/api/persons', (req, res) => {
  Person.find({}).then(data => res.json(data))
})

app.get('/info', (req, res) => {
  Person.countDocuments({}).then(count => {
    const now = new Date().toString()
    res.send(`<p>Phonebook has info for ${count} people</p><p>${now}</p>`)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(p => p ? res.json(p) : res.status(404).end())
    .catch(err => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => next(err))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'name and number required' })
  }
  const entry = new Person({ name: body.name, number: body.number })
  entry.save()
    .then(saved => res.json(saved))
    .catch(err => next(err))
})

app.put('/api/persons/:id', (req,res,next) => {
  const { number } = req.body
  Person.findByIdAndUpdate(
    req.params.id,
    { number },
    { new: true, runValidators: true }
  )
  .then(updated => res.json(updated))
  .catch(err => next(err))
})

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'))
})

const errorHandler = (err, req, res, next) => {
  if (err.name === 'CastError') return res.status(400).send({ error: 'malformed id' })
  if (err.name === 'ValidationError') return res.status(400).json({ error: err.message })
  next(err)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log('Server running on', PORT)
})



