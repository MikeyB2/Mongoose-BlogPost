const express = require('express');
const mongoose = require("mongoose");
const morgan = require('morgan');
const app = express();

mongoose.Promise = global.Promise;

const {
    PORT,
    DATABASE_URL
} = require("./config");

app.use(morgan('common'));

app.use(express.json());

const {
    BlogPost
} = require("./models");

// GET /posts

app.get("/posts", (req, res) => {
    BlogPost.find()
        .then(blogPost => {
            res.json({
                BlogPost: BlogPost.map(restaurant => BlogPost.serialize())
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: "Internal server error"
            });
        });
});

// GET /posts/:id

app.get("/posts/:id", (req, res) => {
    BlogPost
        // this is a convenience method Mongoose provides for searching
        // by the object _id property
        .findById(req.params.id)
        .then(restaurant => res.json(restaurant.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: "Internal server error"
            });
        });
});

// POST /posts


// PUT /posts/:id


// DELETE /posts/:id


// server start and close

let server;

function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(
            databaseUrl,
            err => {
                if (err) {
                    return reject(err);
                }
                server = app
                    .listen(port, () => {
                        console.log(`Your app is listening on port ${port}`);
                        resolve();
                    })
                    .on("error", err => {
                        mongoose.disconnect();
                        reject(err);
                    });
            }
        );
    });
}

// like `runServer`, this function also needs to return a promise.
// `server.close` does not return a promise on its own, so we manually
// create one.
function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log("Closing server");
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {
    app,
    runServer,
    closeServer
};