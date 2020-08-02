const request = require('supertest');

const app = require('../src/app');

describe('GET /api/repo-count-lines', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/repo-count-lines?repo=https://github.com/IgordeOliveira/count-repo-lines')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
