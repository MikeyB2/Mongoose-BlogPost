const chai = require("chai");
const chaiHttp = require("chai-http");

const {
    app,
    runServer,
    closeServer
} = require("../server");

const expect = chai.expect;

chai.use(chaiHttp);


describe("Blog Post", function () {
    before(function () {
        return runServer();
    });
    after(function () {
        return closeServer();
    });
    it("should list of Blog Posts on GET", function () {

        return chai
            .request(app)
            .get("/blog-posts")
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a("array");
                expect(res.body.length).to.be.at.least(1);
                const expectedKeys = ["title", "content", "author", "publishDate"];
                res.body.forEach(function (item) {
                    expect(item).to.be.a("object");
                    expect(item).to.include.keys(expectedKeys);
                });
            });
    });

    it("should add a Blog Post on POST", function () {
        const newBlogPost = {
            title: "chocolate milk",
            content: "the story of how to make chocolate milk",
            author: "mike bryant"

        };
        return chai
            .request(app)
            .post("/blog-posts")
            .send(newBlogPost)
            .then(function (res) {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.a("object");
                expect(res.body).to.include.keys("title", "content", "author", "id");
                expect(res.body.title).to.equal(newBlogPost.title);
            });
    });

    it("should update Blog Post on PUT", function () {
        const updateData = {
            title: "foo-bar",
            content: "foo and bar",
            author: "bizz",
            publishDate: ""
        };

        return (
            chai
                .request(app)
                .get("/blog-posts")
                .then(function (res) {
                    updateData.id = res.body[0].id;
                    return chai
                        .request(app)
                        .put(`/blog-posts/${updateData.id}`)
                        .send(updateData);
                })
                .then(function (res) {
                    expect(res).to.have.status(204);;
                })
        );
    });
    it("should delete Blog Post on DELETE", function () {
        return (
            chai
                .request(app)
                .get("/blog-posts")
                .then(function (res) {
                    return chai.request(app).delete(`/blog-posts/${res.body[0].id}`);
                })
                .then(function (res) {
                    expect(res).to.have.status(204);
                })
        );
    });
});