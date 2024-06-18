```javascript
export const config = {
  app: {
    hostname: 'https://cs329.cs.byu.edu',
  },
  db: {
    connection: {
      host: 'localhost',
      user: 'admin',
      password: 'blahblahblah',
      database: 'autograder',
      connectTimeout: 60000,
    },
  },
  canvas: {
    token: '0000~1234567812345678123456781234567812345678',
    base_url: `https://byu.instructure.com/api/v1/courses/26459`,
  },
  pizza_factory: {
    authtoken: 'token',
  },
  github: {
    personal_access_token: 'ghp_1233456788298e908e839272893792',
  },
};
```
