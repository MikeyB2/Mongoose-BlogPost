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
                blogPost: blogPost.map(blogPost => blogPost.serialize())
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
        .then(blogPost => res.json(blogPost.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: "Internal server error"
            });
        });
});

// POST /posts

app.post("/posts", (req, res) => {
    const requiredFields = ["title", "content", "author"];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    BlogPost.create({
            title: req.body.title,
            content: req.body.content,
            author: req.body.author,
        })
        .then(blogPost => res.status(201).json(blogPost.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: "Internal server error"
            });
        });
});

// PUT /posts/:id

app.put("/posts/:id", (req, res) => {
    // ensure that the id in the request path and the one in request body match
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message =
            `Request path id (${req.params.id}) and request body id ` +
            `(${req.body.id}) must match`;
        console.error(message);
        return res.status(400).json({
            message: message
        });
    }

    // we only support a subset of fields being updateable.
    // if the user sent over any of the updatableFields, we udpate those values
    // in document
    const toUpdate = {};
    const updateableFields = ["title", "content", "author"];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    BlogPost
        // all key/value pairs in toUpdate will be updated -- that's what `$set` does
        .findByIdAndUpdate(req.params.id, {
            $set: toUpdate
        })
        .then(blogPost => res.status(204).end())
        .catch(err => res.status(500).json({
            message: "Internal server error"
        }));
});

// DELETE /posts/:id

app.delete("/posts/:id", (req, res) => {
    BlogPost.findByIdAndRemove(req.params.id)
        .then(blogPost => res.status(204).end())
        .catch(err => res.status(500).json({
            message: "Internal server error"
        }));
});


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