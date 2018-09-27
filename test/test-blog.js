const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require('faker');
const mongoose = require('mongoose');

const {
    app,
    runServer,
    closeServer
} = require("../server");
const { TEST_DATABASE_URL } = require('../config');
const expect = chai.expect;

<<<<<<< HEAD
const { BlogPost } = require('../models.js');
=======
const {
    BlogPost
} = require('../models')
>>>>>>> 3070a592da73dd7d98d0725d84513cda7a5cf4a5

chai.use(chaiHttp);

function seedBlogPosts() {
    console.info('seeding blog post data');
    const seedData = [];

    for (let i = 1; i <= 10; i++) {
        seedData.push(generateBlogPosts());
        // BlogPost.create(generateBlogPosts());
    }
    return BlogPost.insertMany(seedData);
}

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

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Blog Post API resource', function () {
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


    describe('GET endpoint', function () {

        it('should return all existing posts', function () {
            let res;
            return chai.request(app)
                .get('/posts')
                .then(function (_res) {
                    console.log('Testing:' + BlogPost)
                    res = _res;
                    expect(res).to.have.status(200);
                    expect(res.body.blogPosts).to.have.lengthOf.at.least(1);
                    return BlogPost.count();
                })
                .then(function (count) {
                    expect(res.body.blogPosts).to.have.lengthOf(count);
                });
        });


        // it('should return Blog Posts with all the right fields', function () {

        //     let resBlogPosts;
        //     return chai.request(app)
        //         .get('/posts')
        //         .then(function (res) {
        //             expect(res).to.have.status(200);
        //             expect(res).to.be.json;
        //             expect(res.body.blogPosts).to.be.a('array');
        //             expect(res.body.blogPosts).to.have.lengthOf.at.least(1);

        //             res.body.blogPosts.forEach(function (blogPost) {
        //                 expect(blogPost).to.be.a('object');
        //                 expect(blogPost).to.include.keys(
        //                     'id', 'title', 'content', 'author', 'entry');
        //             });
        //             resBlogPosts = res.body.blogPosts[0];
        //             return BlogPost.findById(resBlogPosts.id);
        //         })
        //         .then(function (blogPost) {

        //             expect(resBlogPosts.title).to.equal(blogPost.title);
        //             expect(resBlogPosts.content).to.equal(blogPost.content);
        //             expect(resBlogPosts.author).to.equal(blogPost.authorName);
        //         });
        // });

        // describe('POST endpoint', function () {
        //     it('should add a new Blog Post', function () {

        //         const newBlogPost = generateBlogPosts();

        //         return chai.request(app)
        //             .post('/posts')
        //             .send(newBlogPost)
        //             .then(function (res) {
        //                 expect(res).to.have.status(201);
        //                 expect(res).to.be.json;
        //                 expect(res.body).to.be.a('object');
        //                 expect(res.body).to.include.keys(
        //                     'id', 'title', 'content', 'author', 'entry');
        //                 expect(res.body.title).to.equal(newBlogPost.title);
        //                 expect(res.body.id).to.not.be.null;
        //                 expect(res.body.author).to.equal(`${newBlogPost.firstName} ${newBlogPost.lastName}`);
        //                 expect(res.body.content).to.equal(newBlogPost.content);
        //                 return BlogPost.findById(res.body.id);
        //             })
        //             .then(function (blogPost) {
        //                 expect(blogPost.title).to.equal(newBlogPost.title);
        //                 expect(blogPost.content).to.equal(newBlogPost.content);
        //                 expect(blogPost.author.firstName).to.equal(newBlogPost.author.firstName);
        //                 expect(blogPost.author.lastName).to.equal(newBlogPost.author.lastName);
        //             });
        //     });
        // });

        // describe('PUT endpoint', function () {
        //     it('should update fields you send over', function () {
        //         const updateData = {
        //             title: 'Lorem Ipsum',
        //             content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Laudantium, atque!',
        //             author: {
        //                 firstName: 'Dolor',
        //                 lastName: 'Sit Amet'
        //             }
        //         };

        //         return BlogPost
        //             .findOne()
        //             .then(function (blogPost) {
        //                 updateData.id = blogPost.id;
        //                 return chai.request(app)
        //                     .put(`/posts/${blogPost.id}`)
        //                     .send(updateData);
        //             })
        //             .then(function (res) {
        //                 expect(res).to.have.status(204);

        //                 return BlogPost.findById(updateData.id);
        //             })
        //             .then(function (blogPost) {
        //                 expect(blogPost.title).to.equal(updateData.title);
        //                 expect(blogPost.content).to.equal(updateData.content);
        //                 expect(blogPost.author.firstName).to.equal(updateData.author.firstName);
        //                 expect(blogPost.author.lastName).to.equal(updateData.author.lastName);
        //             });
        //     });
        // });

        // describe('DELETE endpoint', function () {
        //     it('delete a Blog Post by id', function () {

        //         let blogPost;

        //         return BlogPost
        //             .findOne()
        //             .then(function (_blogPost) {
        //                 blogPost = _blogPost;
        //                 return chai.request(app).delete(`/posts/${blogPost.id}`);
        //             })
        //             .then(function (res) {
        //                 expect(res).to.have.status(204);
        //                 return BlogPost.findById(blogPost.id);
        //             })
        //             .then(function (_blogPost) {
        //                 expect(_blogPost).to.be.null;
        //             });
        //     });
        // });
    });
});