// Write your tests here
const server = require('./server')
const db = require('../data/dbConfig')
const request = require('supertest') //Common name selection

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})

test('sanity', () => {
  expect(true).toBe(true)
  expect(10).toBe(5 + 5)
})

describe('Register', () => {
  test('returns 201 status on success', async () => {
    await request(server).post('/api/auth/register')
      .send({username: 'malcom', password: 'mccormick'})
      .expect(201)
  })
  test('returns 401 on invalid username', async () => {
    return await request(server).post('/api/auth/register')
      .send({username: 'malcom', password: 'mccormick'})
      .expect(401)
  })
  test('returns 400 on missing username/password', async () => {
    await request(server).post('/api/auth/register')
      .send({password: 'mccormick'})
      .expect(400)
    await request(server).post('/api/auth/register')
      .send({username: 'malcom'})
      .expect(400)
  })
  test('registration adds user to database', async () => {
    const res = await db('users')
    expect(res).toHaveLength(1)
    expect(res[0].username).toBe('malcom')
  })
})

describe('Login', () => {
  test('receives 200 on success', async () => {
    await request(server).post('/api/auth/register')
      .send({username: 'malcom', password: 'mccormick'})
    await request(server).post('/api/auth/login')
      .send({username: 'malcom', password: 'mccormick'})
      .expect(200)
  })
  test('receives token', async () => {
    await request(server).post('/api/auth/login')
      .send({username: 'malcom', password: 'mccormick'})
      .then(res => {
        expect(res.body.token).toBeDefined()
      })
  })
  test('receives error on invalid password', async () => {
    await request(server).post('/api/auth/login')
      .send({username: 'malcom', password: 'whoops'})
      .then(res => {
        expect(res.body).toMatchObject({ message: 'Invalid credentials' })
      })
  })
})

describe('Jokes Endpoint', () => {
  test('recieves jokes array on success', async () => {
    const response = await request(server).post('/api/auth/login')
      .send({username: 'malcom', password: 'mccormick'})
      .then(res => {
        return res.body.token
      })
    await request(server).get('/api/jokes')
      .set('Authorization', response)
      .then(res => {
        expect(res.body).toHaveLength(3)
      })
  })
  test('receives error on missing token', async () => {
    await request(server).get('/api/jokes')
      .then(res => {
        expect(res.statusCode).toBe(401)
        expect(res.body.message).toBe('token required')
      })
  })
  test('receives error on invalid token', async () => {
    await request(server).get('/api/jokes')
      .set('Authorization', 'IncorrectToken')
      .then(res => {
        expect(res.statusCode).toBe(401)
        expect(res.body.message).toBe('token invalid')
      })
  })
})
