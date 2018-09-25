const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require('faker');
const mongoose = require('mongoose');

const {
    app,
    runServer,
    closeServer
} = require("../server");
const {
    TEST_DATABASE_URL
} = require('../config');
const expect = chai.expect;

const {
    BlogPost
} = require('../models')

chai.use(chaiHttp);

function seedBlogPosts() {
    console.info('seeding blog post data');
    const seedData = [];

    for (let i = 1; i <= 10; i++) {
        seedData.push(generateBlogPosts());
    }
    // this will return a promise
    return BlogPost.insertMany(seedData);
}

// generate an object representing a blog post data.
// can be used to generate seed data for db
// or request.body data
function generateBlogPosts() {
    return {
        author: {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
        },
        title: faker.lorem.sentence(),
        content: faker.lorem.text()
    };
}


// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure data from one test does not stick
// around for next one
function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Blog Post API resource', function () {

    // we need each of these hook functions to return a promise
    // otherwise we'd need to call a `done` callback. `runServer`,
    // `seedBlogPosts` and `tearDownDb` each return a promise,
    // so we return the value returned by these function calls.
    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function () {
        return seedBlogPosts();
    });

    afterEach(function () {
        return tearDownDb();
    });

    after(function () {
        return closeServer();
    });


    // note the use of nested `describe` blocks.
    // this allows us to make clearer, more discrete tests that focus
    // on proving something small
    describe('GET endpoint', function () {

        it('should return all existing posts', function () {
            // strategy:
            //    1. get back all posts returned by by GET request to `/posts`
            //    2. prove res has right status, data type
            //    3. prove the number of posts we got back is equal to number
            //       in db.
            //
            let res;
            return chai.request(app)
                .get('/posts')
                .then(function (_res) {
                    res = _res;
                    expect(res).to.have.status(200);
                    expect(res.body.blogPosts).to.have.lengthOf.at.least(1);
                    return BlogPost.count();
                })
                .then(function (count) {
                    expect(res.body.blogPosts).to.have.lengthOf(count);
                });
        });


        it('should return Blog Posts with all the right fields', function () {
            // Strategy: Get back all Posts, and ensure they have expected keys

            let resBlogPosts;
            return chai.request(app)
                .get('/posts')
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.blogPosts).to.be.a('array');
                    expect(res.body.blogPosts).to.have.lengthOf.at.least(1);

                    res.body.blogPosts.forEach(function (blogPost) {
                        expect(blogPost).to.be.a('object');
                        expect(blogPost).to.include.keys(
                            'id', 'title', 'content', 'author', 'entry');
                    });
                    resBlogPosts = res.body.blogPosts[0];
                    return BlogPost.findById(resBlogPosts.id);
                })
                .then(function (blogPost) {

                    expect(resBlogPosts.title).to.equal(blogPost.title);
                    expect(resBlogPosts.content).to.equal(blogPost.content);
                    expect(resBlogPosts.author).to.equal(blogPost.authorName);
                });
        });

        describe('POST endpoint', function () {
            // strategy: make a POST request with data,
            // then prove that the Blog Post we get back has
            // right keys, and that `id` is there (which means
            // the data was inserted into db)
            it('should add a new Blog Post', function () {

                const newBlogPost = generateBlogPosts();

                return chai.request(app)
                    .post('/posts')
                    .send(newBlogPost)
                    .then(function (res) {
                        expect(res).to.have.status(201);
                        expect(res).to.be.json;
                        expect(res.body).to.be.a('object');
                        expect(res.body).to.include.keys(
                            'id', 'title', 'content', 'author', 'entry');
                        expect(res.body.title).to.equal(newBlogPost.title);
                        // cause Mongo should have created id on insertion
                        expect(res.body.id).to.not.be.null;
                        expect(res.body.author).to.equal(`${newBlogPost.firstName} ${newBlogPost.lastName}`);
                        expect(res.body.content).to.equal(newBlogPost.content);
                        return BlogPost.findById(res.body.id);
                    })
                    .then(function (blogPost) {
                        expect(blogPost.title).to.equal(newBlogPost.title);
                        expect(blogPost.content).to.equal(newBlogPost.content);
                        expect(blogPost.author.firstName).to.equal(newBlogPost.author.firstName);
                        expect(blogPost.author.lastName).to.equal(newBlogPost.author.lastName);
                    });
            });
        });

        describe('PUT endpoint', function () {

            // strategy:
            //  1. Get an existing Post from db
            //  2. Make a PUT request to update that Post
            //  3. Prove the Post returned by request contains data we sent
            //  4. Prove the Post in db is correctly updated
            it('should update fields you send over', function () {
                const updateData = {
                    title: 'Lorem Ipsum',
                    content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Laudantium, atque!',
                    author: {
                        firstName: 'Dolor',
                        lastName: 'Sit Amet'
                    }
                };

                return BlogPost
                    .findOne()
                    .then(function (blogPost) {
                        updateData.id = blogPost.id;

                        // make request then inspect it to make sure it reflects
                        // data we sent
                        return chai.request(app)
                            .put(`/posts/${blogPost.id}`)
                            .send(updateData);
                    })
                    .then(function (res) {
                        expect(res).to.have.status(204);

                        return BlogPost.findById(updateData.id);
                    })
                    .then(function (blogPost) {
                        expect(blogPost.title).to.equal(updateData.title);
                        expect(blogPost.content).to.equal(updateData.content);
                        expect(blogPost.author.firstName).to.equal(updateData.author.firstName);
                        expect(blogPost.author.lastName).to.equal(updateData.author.lastName);
                    });
            });
        });

        describe('DELETE endpoint', function () {
            // strategy:
            //  1. get a Post
            //  2. make a DELETE request for that Post's id
            //  3. assert that response has right status code
            //  4. prove that the Post with the id doesn't exist in db anymore
            it('delete a Blog Post by id', function () {

                let blogPost;

                return BlogPost
                    .findOne()
                    .then(function (_blogPost) {
                        blogPost = _blogPost;
                        return chai.request(app).delete(`/posts/${blogPost.id}`);
                    })
                    .then(function (res) {
                        expect(res).to.have.status(204);
                        return BlogPost.findById(blogPost.id);
                    })
                    .then(function (_blogPost) {
                        expect(_blogPost).to.be.null;
                    });
            });
        });
    });
});