const request = require('supertest')
const server = require('../server')
const db = require('../data/db-config')
const bcrypt = require('bcryptjs')

const newUser = {username: 'ChuckTesta', password: '1234', phonenumber: '330-867-5309'}
const oldUser = {username: 'OldMan', password: 'password', phonenumber: '444-444-4444'}
const plantData = [
  {"h2ofrequency": "7", "nickname": "steve", "plantid": 1, "species": "aloe vera", "userid": 1}, 
  {"h2ofrequency": "4", "nickname": "rubber plant", "plantid": 2, "species": "ficus elastica", "userid": 1}
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
//[POST] /api/auth/register - registers a user with hashed password XX
//[POST] /api/auth/login - authenticates user and returns a token XX
//[GET] /api/auth/logout - logs user out
//[GET] /api/users/users - returns a list of users to authenticated request XX
//[GET] /api/users/user/:userid - returns user info (username, phonenumber) XX
//[PUT] /api/user//user/:userid - updates user info (phonenumber, password) XX
//[GET] /api/users/user/:userid/plants - returns a list of plants to authenticated user XX
//[POST] /api/plants/plant/:userid - adds plant to user's plants XX
//[GET] /api/plants/plant/:plantid - returns plant by id XX
//[GET] /api/plants/plants - get all plants (for all users) straight up all of them XX
//[PUT] /api/plants/plant/:plantid - updates plant with given id XX
//[DELETE] /api/plants/plant/:plantid - deletes plant with given id X

describe('[POST] /api/auth/register', () => {

  it('responds with a status code of 201 on successful registration', async () => {
    const res = await request(server).post('/api/auth/register').send(newUser);
    expect(res.status).toBe(201);
  });

  it('responds with new user on success', async () => {
    const res = await request(server).post('/api/auth/register').send(newUser);
    expect(res.body).toMatchObject({user: {username: 'ChuckTesta', phonenumber:'330-867-5309', userid: 2} });
  });

  it('adds new user to user table on success', async () => {
    await request(server).post('/api/auth/register').send(newUser);
    const check = await db('users').where('username', newUser.username).first();
    expect(check.username).toBe('ChuckTesta');
    expect(check.phonenumber).toBe('330-867-5309');
  });

  it('encrypts user password in database', async () => {
    await request(server).post('/api/auth/register').send(newUser);
    const check = await db('users').where('username', newUser.username).first();
    expect(bcrypt.compareSync(newUser.password, check.password)).toBeTruthy();
  });

  it('responds with status code 400 if username, password, or phonenumber is missing', async () => {
    const res1 = await request(server).post('/api/auth/register').send({ username: 'NoPassword', phonenumber: '555-555-5555' });
    expect(res1.status).toBe(400);
    const res2 = await request(server).post('/api/auth/register').send({ username: 'NoPhone', password: 'password' });
    expect(res2.status).toBe(400);
    const res3 = await request(server).post('/api/auth/register').send({ password: 'NoUser', phonenumber: '555-555-5555' });
    expect(res3.status).toBe(400);
  });

  it('responds with status code 400 if username or phonenumber is taken', async () => {
    const res1 = await request(server).post('/api/auth/register').send({ username: 'OldMan', phonenumber: '123-456-7777', password: 'newpass' });
    expect(res1.status).toBe(400);
    const res2 = await request(server).post('/api/auth/register').send({ username: 'NovelThompson', phonenumber: '444-444-4444', password: 'newpass'});
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
    expect(res.body).toHaveProperty('access_token');
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

  it('responds appropriately when token is missing', async () => {
    const res = await request(server).get('/api/users/users');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('token required');
  });
 
  it('responds appropriately when token is expired/invalid', async () => {
    const res = await request(server).get('/api/users/users').set('Authorization', 'badToken');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('token invalid');
  });
  

  it('responds with status 200', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).get('/api/users/users').set('Authorization', login.body.access_token);
    expect(res.status).toBe(200);
  });

  it('responds with array of users', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser)
    const res = await request(server).get('/api/users/users').set('Authorization', login.body.access_token);
    expect(res.body).toEqual([{ username: 'OldMan', phonenumber: '444-444-4444', userid: 1 }]);
  });

})

describe('[GET] /api/users/user/:id', () => {

  it('responds appropriately when token is missing', async () => {
    const res = await request(server).get('/api/users/user/1');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('token required');
  });
 
  it('responds appropriately when token is expired/invalid', async () => {
    const res = await request(server).get('/api/users/user/1').set('Authorization', 'badToken');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('token invalid');
  });

  it('responds with status 200 on success', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).get('/api/users/user/1').set('Authorization', login.body.access_token);
    expect(res.status).toBe(200);
  });

  it('responds with user info', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).get('/api/users/user/1').set('Authorization', login.body.access_token);
    expect(res.body).toEqual({username: 'OldMan', phonenumber: '444-444-4444'});
  });

  it('responds with status 400 if userid not found', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).get('/api/users/user/9').set('Authorization', login.body.access_token);
    expect(res.status).toBe(400); 
  })

  it('responds with proper message if userid not found', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).get('/api/users/user/9').set('Authorization', login.body.access_token);
    expect(res.body.message).toBe('user with id 9 not found'); 
  });

});

describe('[PUT] /api/users/user/:id', () => {

  it('responds appropriately when token is missing', async () => {
    const res = await request(server).put('/api/users/user/1');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('token required');
  });
 
  it('responds appropriately when token is expired/invalid', async () => {
    const res = await request(server).put('/api/users/user/1').set('Authorization', 'badToken');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('token invalid');
  });

  it('updates username and password on success', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    await request(server).put('/api/users/user/1').send({username: 'newName'}).set('Authorization', login.body.access_token);
    const check = await db('users').where('userid', 1).first();
    expect(check.username).toBe('newName');
    expect(bcrypt.compareSync('password', check.password)).toBeTruthy();
  });

  it('responds with updated user on success', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).put('/api/users/user/1').send({password: 'newpassword', username: 'newName'}).set('Authorization', login.body.access_token); 
    expect(res.body).toMatchObject({ user: { username: 'newName', phonenumber: '444-444-4444' } });
  });

  it('responds with status 400 if userid not found', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).put('/api/users/user/9').set('Authorization', login.body.access_token);
    expect(res.status).toBe(400); 
  })

  it('responds with proper message if userid not found', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).put('/api/users/user/9').set('Authorization', login.body.access_token);
    expect(res.body.message).toBe('user with id 9 not found'); 
  });

});

describe('[GET] /api/users/user/:id/plants', () => {

  it('responds appropriately when token is missing', async () => {
    const res = await request(server).get('/api/users/user/1/plants');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('token required');
  });
 
  it('responds appropriately when token is expired/invalid', async () => {
    const res = await request(server).get('/api/users/user/1/plants').set('Authorization', 'badToken');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('token invalid');
  });
  
  it('responds with status 200 on success', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser)
    const res = await request(server).get('/api/users/user/1/plants').set('Authorization', login.body.access_token);
    expect(res.status).toBe(200);
  });

  it('responds with array of users plants', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser)
    const res = await request(server).get('/api/users/user/1/plants').set('Authorization', login.body.access_token);
    expect(res.body).toEqual(plantData);
  });

  it('responds with status 400 if userid not found', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).get('/api/users/user/9/plants').set('Authorization', login.body.access_token);
    expect(res.status).toBe(400); 
  })

  it('responds with proper message if userid not found', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).get('/api/users/user/9/plants').set('Authorization', login.body.access_token);
    expect(res.body.message).toBe('user with id 9 not found'); 
  });

});

describe('[GET] /api/plants/plants', () => {

  it('responds with status code 200 on success', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).get('/api/plants/plants').set('Authorization', login.body.access_token);
    expect(res.status).toBe(200);
  });

  it('responds with array of plants on success', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).get('/api/plants/plants').set('Authorization', login.body.access_token);
    expect(res.body).toEqual(plantData);
  });

});

describe('[GET] /api/plants/plant/:plantid', () => {

  it('responds with status code 200 on success', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).get('/api/plants/plant/1').set('Authorization', login.body.access_token);
    expect(res.status).toBe(200);
  });

  it('responds with plant info on success', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).get('/api/plants/plant/1').set('Authorization', login.body.access_token);
    expect(res.body).toEqual(plantData[0]);
  });

  it('responds with 400 error if plant id does not exist', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).get('/api/plants/plant/9').set('Authorization', login.body.access_token);
    expect(res.status).toBe(400); 
  });

});

describe('[POST] /api/plants/plant/:userid', () => {

  it('responds with status code 201 on success', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).post('/api/plants/plant/1').set('Authorization', login.body.access_token).send({ nickname: 'newPlant', h2ofrequency: 2, species: 'test'});
    expect(res.status).toBe(201);
  });

  it('responds with newly created plant', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).post('/api/plants/plant/1').set('Authorization', login.body.access_token).send({ nickname: 'newPlant', h2ofrequency: 2, species: 'test'}); 
    expect(res.body).toMatchObject({ nickname: 'newPlant', h2ofrequency: '2', species: 'test'});
  });

  it('adds plant to plants table on success', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    await request(server).post('/api/plants/plant/1').set('Authorization', login.body.access_token).send({ nickname: 'newPlant', h2ofrequency: 2, species: 'test'});
    const check = await db('plants').where('plantid', 3).first();
    expect(check.nickname).toBe('newPlant');
  });

  it('responds with 400 error if userid does not exist', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).post('/api/plants/plant/9').set('Authorization', login.body.access_token).send({ nickname: 'newPlant', h2ofrequency: 2, species: 'test'}); 
    expect(res.status).toBe(400);
  });

  it('responds with 400 error if required fields missing', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).post('/api/plants/plant/1').set('Authorization', login.body.access_token).send({ nickname: 'newPlant', species: 'test'}); 
    expect(res.status).toBe(400);
  });

});

describe('[PUT], /api/plants/plant/:plantid', () => {

  it('responds with status code 200 on success', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).put('/api/plants/plant/1').set('Authorization', login.body.access_token).send({...plantData[0], nickname: 'newName'});
    expect(res.status).toBe(200);
  });

  it('responds with the updated plant', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).put('/api/plants/plant/1').set('Authorization', login.body.access_token).send({...plantData[0], nickname: 'newName'}); 
    expect(res.body).toMatchObject({"h2ofrequency": "7", "nickname": "newName", "plantid": 1, "species": "aloe vera", "userid": 1});
  });

  it('updates plant info on success', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    await request(server).put('/api/plants/plant/1').set('Authorization', login.body.access_token).send({nickname: 'newName'});
    const check = await db('plants').where('plantid', 1).first()
    expect(check.nickname).toBe('newName');
  });

  it('responds with 400 error if plant id does not exist', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).put('/api/plants/plant/9').set('Authorization', login.body.access_token).send({...plantData[0], nickname: 'newName'}); 
    expect(res.status).toBe(400);
  });

});

describe('[DELETE], /api/plants/plant/:plantid', () => {

  it('responds with status code 200 on success', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).delete('/api/plants/plant/1').set('Authorization', login.body.access_token);
    expect(res.status).toBe(200);
  });

  it('deletes plant from plants table on success', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    await request(server).delete('/api/plants/plant/1').set('Authorization', login.body.access_token);
    const check = await db('plants')
    expect(check.length).toBe(1);
  });

  it('responds with 400 error if plant id does not exist', async () => {
    const login = await request(server).post('/api/auth/login').send(oldUser);
    const res = await request(server).delete('/api/plants/plant/9').set('Authorization', login.body.access_token);
    expect(res.status).toBe(400); 
  });

});

it('getuserinfo', async () => {
  const login = await request(server).post('/api/auth/login').send(oldUser);
  const res = await request(server).get('/api/users/getuserinfo').set('Authorization', login.body.access_token);
  expect(res.body).toMatchObject({ userid: 1, username: 'OldMan', phonenumber: '444-444-4444'});
  expect(res.body).toHaveProperty('plants');
});