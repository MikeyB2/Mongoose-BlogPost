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
    Author,
    BlogPost

} = require("./models");

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET /authors

app.get("/authors", (req, res) => {
    Author.find()
        .then(author => {
            res.json(author.map(author => author.serialize()));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: "What did you do!4"
            });
        });
});

// POST /authors

app.post("/authors", (req, res) => {
    const requiredFields = ["firstName", "lastName", "userName"];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    };
    // checking to see if the username already exists and if not create it
    Author
        .findOne({
            userName: req.body.userName
        })
        .then(author => {
            if (author) {
                const message = `Username already exists`;
                console.error(message);
                return res.status(400).send(message);
            } else {
                Author
                    .create({
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        userName: req.body.userName
                    })
                    .then(author => res.status(201).json(author.serialize()))
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({
                            error: 'What did you do!2'
                        });
                    });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'Why did you do that?!2'
            });
        });
});

// PUT /authors/:id

app.put('/authors/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
            error: 'Id requested does not match Id in the update'
        });
    }

    const updated = {};
    const updateableFields = ['firstName', 'lastName', 'userName'];
    updateableFields.forEach(field => {
        if (field in req.body) {
            updated[field] = req.body[field];
        }
    });

    Author
        .findOne({
            userName: updated.userName || '',
            _id: {
                $ne: req.params.id
            }
        })
        .then(author => {
            if (author) {
                const message = `Username already exist choose another Username`;
                console.error(message);
                return res.status(400).send(message);
            } else {
                Author
                    .findByIdAndUpdate(req.params.id, {
                        $set: updated
                    }, {
                        new: true
                    })
                    .then(updatedAuthor => {
                        res.status(200).json({
                            id: updatedAuthor.id,
                            name: `${updatedAuthor.firstName} ${updatedAuthor.lastName}`,
                            userName: updatedAuthor.userName
                        });
                    })
                    .catch(err => res.status(500).json({
                        message: err
                    }));
            }
        });
});

// DELETE /authors/:id

app.delete("/authors/:id", (req, res) => {
    Author.remove({
            author: req.params.id
        })
        .then(() => {
            Author.findByIdAndRemove(req.params.id)
                .then(author => res.status(204).end())
                .catch(err => res.status(500).json({
                    message: "What did you do!3"
                }));
        });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET /posts

app.get("/posts", (req, res) => {
    BlogPost.find()
        .then(blogPost => {
            res.json(blogPost.map(blogPost => blogPost.serialize()));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: "What did you do!4"
            });
        });
});

// GET /posts/:id

app.get("/posts/:id", (req, res) => {
    BlogPost
        .findById(req.params.id)
        .then(blogPost => res.json(blogPost.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: "What did you do!5"
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
            author: req.body.id,
        })
        .then(blogPost => res.status(201).json(blogPost.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: "What did you do!6"
            });
        });
});

// PUT /posts/:id

app.put("/posts/:id", (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message =
            `Request path id (${req.params.id}) and request body id ` +
            `(${req.body.id}) must match`;
        console.error(message);
        return res.status(400).json({
            message: message
        });
    }
    const toUpdate = {};
    const updateableFields = ["title", "content", "author"];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    BlogPost
        .findByIdAndUpdate(req.params.id, {
            $set: toUpdate
        })
        .then(blogPost => res.status(204).end())
        .catch(err => res.status(500).json({
            message: "What did you do!7"
        }));
});


// DELETE /posts/:id

app.delete("/posts/:id", (req, res) => {
    BlogPost.findByIdAndRemove(req.params.id)
        .then(blogPost => res.status(204).end())
        .catch(err => res.status(500).json({
            message: "What did you do!8"
        }));
});


// server start and close

let server;

// start the server
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

// close the server
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