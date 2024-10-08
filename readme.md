# Nature Tours website

### [Click to see Live Demo](https://adventour.onrender.com/)

<hr />

### Contributors
> 1. [Rajat Verma](https://github.com/rajatverma311201)
> 2. [Sahil Rathore](https://github.com/rathoreSahil) 
<hr />

### Project Images
- ### Home Page
![Home Page](/public/project/1.png)

- ### Tour Page
![Tour Page](/public/project/2.png)

- ### Tour Description
![Tour Description](/public/project/3.png)

- ### Reviews
![Reviews](/public/project/5.png)

- ### Profile
![Profile](/public/project/7.png)


### A ficitional Tour booking website made with

> -   NodeJS and ExpressJS
> -   MongoDB and Mongoose
> -   HTML CSS and JavaScript
### Features of the Web App

> -   It is a Server Side Rendered Website having EJS as the view engine
> -   Built the REST (REpresentational State Transfer) API with Node, Express and Mongoose
> -   The WebApp implements MVC (Model-View-Controller) architecture
> -   Functionality of User Signup, login, reset account password is implemented
> -   User can make payment and book tour, see all tours, give reviews on a tour.
> -   Admin can delete, create and get all users, delete, create and get all tours, update and delete reviews
### Some important modules used for Security purpose

```
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
```

> -   Rate Limit is the module used for limiting the no. of requests made by a client
> -   Helmet helps us secure our Express.js apps by securing various HTTP headers.
> -   Mongo Sanitize sanitizes mongodb queries against NOSQL query injections.
> -   XSS modules help us to prevent cross site scripting attacks.
> -   HPP module helps us to prevent attacks against HTTP parameter pollution..
> -   Crypto module used for generating hash token for reset password functionality of the user.
> -   JWT is used for stateless authentication mechanisms for users and providers.
> -   Bcrypt to hash user password and then store them in the database instead of plain password for security purposes.
