const request = require('supertest')
const server = require('../server')
const db = require('../data/db-config')
const bcrypt = require('bcryptjs')

const newUser = {username: 'ChuckTesta', password: '1234', phone: '330-867-5309'}
const oldUser = {username: 'OldMan', password: 'password', phone: '444-444-4444'}
const plantData = [
  {"h2oFrequency": "7", "nickname": "steve", "plantid": 1, "species": "aloe vera", "userid": 1}, 
  {"h2oFrequency": "4", "nickname": "rubber plant", "plantid": 2, "species": "ficus elastica", "userid": 1}
]

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
//[POST] /api/auth/register - registers a user with hashed password X
//[POST] /api/auth/login - authenticates user and returns a token X
//[GET] /api/auth/logout - logs user out
//[GET] /api/users/users - returns a list of users to authenticated request X
//[GET] /api/users/user/:userid - returns user info (username, phone number) X
//[PUT] /api/user//user/:userid - updates user info (phone number, password)
//[GET] /api/users/user/:userid/plants - returns a list of plants to authenticated user X
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
    expect(res.body).toEqual({ username: 'ChuckTesta', phone: '330-867-5309' });
  });

  it('adds new user to user table on success', async () => {
    await request(server).post('/api/auth/register').send(newUser);
    const check = await db('users').where('username', newUser.username).first();
    expect(check.username).toBe('ChuckTesta');
    expect(check.phone).toBe('330-867-5309');
  });

  it('encrypts user password in database', async () => {
    await request(server).post('/api/auth/register').send(newUser);
    const check = await db('users').where('username', newUser.username).first();
    expect(bcrypt.compareSync(newUser.password, check.password)).toBeTruthy();
  });

  it('responds with status code 400 if username, password, or phone number is missing', async () => {
    const res1 = await request(server).post('/api/auth/register').send({ username: 'NoPassword', phone: '555-555-5555' });
    expect(res1.status).toBe(400);
    const res2 = await request(server).post('/api/auth/register').send({ username: 'NoPhone', password: 'password' });
    expect(res2.status).toBe(400);
    const res3 = await request(server).post('/api/auth/register').send({ password: 'NoUser', phone: '555-555-5555' });
    expect(res3.status).toBe(400);
  });

  it('responds with status code 400 if username or phone number is taken', async () => {
    const res1 = await request(server).post('/api/auth/register').send({ username: 'OldMan', phone: '123-456-7777', password: 'newpass' });
    expect(res1.status).toBe(400);
    const res2 = await request(server).post('/api/auth/register').send({ username: 'NovelThompson', phone: '444-444-4444', password: 'newpass'});
    expect(res2.status).toBe(400);
  });
});

describe('[POST] /api/auth/login', () => {
  
  it('responds with status code 200 on successful login', async () => {
    const res = await request(server).post('/api/auth/login').send(oldUser);
    expect(res.status).toBe(200);
  });

  it('responds with success message and token on login', async () => {
    const res = await request(server).post('/api/auth/login').send(oldUser);
    expect(res.body.message).toBe('successful login');
    expect(res.body).toHaveProperty('token');
  });

  it('responds with status code 400 if username or password is missing', async () => {
    const res1 = await request(server).post('/api/auth/login').send({ username: 'OldMan' })
    expect(res1.status).toBe(400);
    const res2 = await request(server).post('/api/auth/login').send({ password: 'password' })
    expect(res2.status).toBe(400);
  });

  it('responds with status 401 on bad credentials', async () => {
    const res1 = await request(server).post('/api/auth/login').send({ username: 'OldMan', password: 'totallyFake' });
    expect(res1.status).toBe(401);
  });

})

describe('[GET] /api/users/users', () => {

  it('responds with status 200', async () => {
    const res = await request(server).get('/api/users/users');
    expect(res.status).toBe(200);
  });

  it('responds with array of users', async () => {
    const res = await request(server).get('/api/users/users');
    expect(res.body).toEqual([]);
  });

})

describe('[GET] /api/users/user/:id', () => {

  it('responds with status 200 on success', async () => {
    const res = await request(server).get('/api/users/user/1');
    expect(res.status).toBe(200);
  });

  it('responds with user info', async () => {
    const res = await request(server).get('/api/users/user/1');
    expect(res.body).toBe(200);
  });
});

describe('[PUT] /api/users/user/:id', () => {

  it('updates username and password on success', async () => {
    const res = await request(server).put('/api/users/user/1').send();
    expect(res).toBe(false);
  });
});

describe('[GET] /api/users/user/:id/plants', () => {
  
  it('responds with status 200 on success', async () => {
    const res = await request(server).get('/api/users/user/1/plants');
    expect(res.status).toBe(200);
  });

  it('responds with array of users plants', async () => {
    const res = await request(server).get('/api/users/user/1/plants');
    expect(res.body).toEqual(plantData);
  });

})