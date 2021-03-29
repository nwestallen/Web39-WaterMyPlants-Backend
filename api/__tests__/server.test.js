const request = require('supertest')
const server = require('../server')
const db = require('../data/db-config')
const bcrypt = require('bcryptjs')

const newUser = {user_username: 'ChuckTesta', user_password: '1234', user_phone: '330-867-5309'}

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
beforeEach(async () => {
  await db.seed.run()
})
afterAll(async (done) => {
  await db.destroy()
  done()
})

it('sanity check', () => {
  expect(true).not.toBe(false)
})

describe('server.js', () => {
  it('is the correct testing environment', async () => {
    expect(process.env.NODE_ENV).toBe('testing')
  })
})

//---------------------------- ENDPOINTS ------------------------------
//[POST] /api/auth/register - registers a user with hashed password
//[POST] /api/auth/login - authenticates user and returns a token
//[GET] /api/auth/logout - logs user out
//[GET] /api/users/users - returns a list of users to authenticated request
//[GET] /api/users/user/:userid - returns user info (username, phone number)
//[PUT] /api/user//user:userid - updates user info (phone number, password)
//[GET] /api/users/user/:userid/plants - returns a list of plants to authenticated user
//[POST] /api/plants/plant/ - adds plant to user's plants
//[GET] /api/plants/plant/:plantid - returns plant by id
//[GET] /api/plants/plants - get all plants (for all users) straight up all of them
//[PUT] /api/plants/plant/:plantid - updates plant with given id
//[DELETE] /api/plants/plant/:plantid - deletes plant with given id

describe('[POST] /api/auth/register', () => {

  it('responds with a status code of 201 on successful registration', async () => {
    const res = await request(server).post('/api/auth/register').send(newUser);
    expect(res.status).toBe(201);
  });

  it('responds with username and phone number on success', async () => {
    const res = await request(server).post('/api/auth/register').send(newUser);
    expect(res.body).toEqual({ user_username: 'ChuckTesta', user_phone: '330-867-5309' });
  });

  it('adds new user to user table on success', async () => {
    await request(server).post('/api/auth/register').send(newUser);
    const check = await db('users').where('user_username', newUser.user_username).first();
    expect(check.user_username).toBe('ChuckTesta');
    expect(check.user_phone).toBe('330-867-5309');
  });

  it('encrypts user password in database', async () => {
    await request(server).post('/api/auth/register').send(newUser);
    const check = await db('users').where('user_username', newUser.user_username).first();
    expect(bcrypt.compareSync(newUser.user_password, check.user_password)).toBeTruthy();
  });

  it('responds with status code 400 if username, password, or phone number is missing', async () => {
    const res1 = await request(server).post('/api/auth/register').send({ user_username: 'NoPassword', user_phone: '555-555-5555' });
    expect(res1.status).toBe(400);
    const res2 = await request(server).post('/api/auth/register').send({ user_username: 'NoPhone', user_password: 'password' });
    expect(res2.status).toBe(400);
    const res3 = await request(server).post('/api/auth/register').send({ user_password: 'NoUser', user_phone: '555-555-5555' });
    expect(res3.status).toBe(400);
  });

  it('responds with status code 400 if username or phone number is taken', async () => {
    const res1 = await request(server).post('/api/auth/register').send({ user_username: 'ChuckTesta', user_phone: '123-456-7777', user_password: 'newpass' });
    expect(res1.status).toBe(400);
  });
});