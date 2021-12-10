const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

// getUserByEmail Test
const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    assert.equal(user, testUsers.userRandomID);
  });

  it('should return undefined when looking for a non-existent email', () => {
    const user = getUserByEmail('user3@example.com', testUsers);
    assert.equal(user, undefined);
  });
});

// urlsForUser Test
const testUrls = {
  '1234': {
    longURL: 'http://www.google.com',
    userID: 'user1'
  },
  'abcd': {
    longURL: 'http://www.lighthouse.com',
    userID: 'user2'
  },
  '5678': {
    longURL: 'http://www.youtube.com',
    userID: 'user1'
  }
};

describe('#urlsForUser', () => {
  it('should return the corresponding urls for a valid user', () => {
    const userUrls = urlsForUser('user1', testUrls);
    const expectedResult = {
      '1234': {
        longURL: 'http://www.google.com',
        userID: 'user1'
      },
      '5678': {
        longURL: 'http://www.youtube.com',
        userID: 'user1'
      }
    };

    assert.deepEqual(userUrls, expectedResult);
  });

  it('should return an empty obhect for a non-existent user', () => {
    const userUrls = urlsForUser('user3', testUrls);
    assert.deepEqual(userUrls, {});
  });
});