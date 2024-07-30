# AutoGrader

## SAML

The AutoGrader uses the SAML protocol for authentication with BYU CAS as the service provider, using the [saml2-js](https://www.npmjs.com/package/saml2-js) library to abstract most of the implementation. The certificates (`byu.crt` and `sp.crt`) for this are kept in the `certs` directory and are non-confidential. The `sp.key` file should not be publicly visible, hence it is created in the [deployment script](deploy.sh).

## Configuration

This is an example config file. It should never be committed.

```javascript
export const config = {
  app: {
    // Where the autograder is deployed
    hostname: 'https://cs329.cs.byu.edu',
  },
  db: {
    // credentials for db connection
    connection: {
      host: 'localhost',
      user: 'admin',
      password: 'blahblahblah',
      database: 'autograder',
      connectTimeout: 60000,
    },
  },
  canvas: {
    // api key from TA account for submitting grades
    token: '0000~1234567812345678123456781234567812345678',
    base_url: `https://byu.instructure.com/api/v1/courses/26459`,
  },
  pizza_factory: {
    // everything needed to add users as vendors, get tokens for them, and cause chaos
    url: 'https://pizza-factory.cs329.click',
    authtoken: 'token',
  },
  github: {
    // access token for byucs329ta, used to trigger workflows
    personal_access_token: 'ghp_12345678_12345678',
  },
};
```
