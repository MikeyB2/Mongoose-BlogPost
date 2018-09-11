const express = require('express');
const morgan = require('morgan');
const app = express();
const blogPostRouter = require('./blogPostRouter');
app.use(morgan('common'));

app.use(express.json());


// Use Express router and modularize routes to /blog-posts.
app.use('/blog-posts', blogPostRouter);
// Add a couple of blog posts on server load so you'll automatically have some data to look at when the server starts.

app.listen(process.env.PORT || 8080, () => {
    console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});

if (require.main === module) {
    runServer().catch(err => console.error(err));
}

module.exports = {
    app,
    runServer,
    closeServer
};