# AutoGrader

## Design

This app uses a React frontend with a Typescript backend, using the `express` library for the server. There are two main objects passed between the front- and backend: [User](frontend/src/model/domain/User.ts) and [Submission](frontend/src/model/domain/Submission.ts). Note to avoid the complexity of a shared module, these files are duplicated across the front- and backend, so if you change one, change the other.

## Deployment

This app is hosted on an EC2 server, and deployed using a [shell script](deploy.sh) with a private key. The following command executes the script with the necessary parameters.

```sh
# -k keyfile -h hostname -s service
sh deploy.sh -k cs329.pem -h cs329.click -s grade
```

The running service is managed on the server using [pm2](https://www.npmjs.com/package/pm2).

## Authentication

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
