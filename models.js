const uuid = require('uuid');

// This module provides volatile storage, using a `BlogPost`
// model. We haven't learned about databases yet, so for now
// we're using in-memory storage. This means each time the app stops, our storage
// gets erased.

// Don't worry too much about how BlogPost is implemented.
// Our concern in this example is with how the API layer
// is implemented, and getting it to use an existing model.

const mongoose = require("mongoose");

const blogPostSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    borough: {
        type: String,
        required: true
    },
    cuisine: {
        type: String,
        required: true
    },
    address: {
        building: String,
        // coord will be an array of string values
        coord: [String],
        street: String,
        zipcode: String
    },
    // grades will be an array of objects
    grades: [{
        date: Date,
        grade: String,
        score: Number
    }]
});


// *virtuals* (http://mongoosejs.com/docs/guide.html#virtuals)
// allow us to define properties on our object that manipulate
// properties that are stored in the database. Here we use it
// to generate a human readable string based on the address object
// we're storing in Mongo.
blogPostSchema.virtual("addressString").get(function () {
    return `${this.address.building} ${this.address.street}`.trim();
});

// this virtual grabs the most recent grade for a restaurant.
blogPostSchema.virtual("grade").get(function () {
    const gradeObj =
        this.grades.sort((a, b) => {
            return b.date - a.date;
        })[0] || {};
    return gradeObj.grade;
});

// this is an *instance method* which will be available on all instances
// of the model. This method will be used to return an object that only
// exposes *some* of the fields we want from the underlying data
blogPostSchema.methods.serialize = function () {
    return {
        id: this._id,
        name: this.name,
        cuisine: this.cuisine,
        borough: this.borough,
        grade: this.grade,
        address: this.addressString
    };
};

// note that all instance methods and virtual properties on our
// schema must be defined *before* we make the call to `.model`.
const blogPost = mongoose.model("Blog Post", blogPostSchema);

module.exports = {
    BlogPost
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function StorageException(message) {
    this.message = message;
    this.name = "StorageException";
}

const BlogPosts = {
    create: function (title, content, author, publishDate) {
        const post = {
            id: uuid.v4(),
            title: title,
            content: content,
            author: author,
            publishDate: publishDate || Date.now()
        };
        this.posts.push(post);
        return post;
    },
    get: function (id = null) {
        // if id passed in, retrieve single post,
        // otherwise send all posts.
        if (id !== null) {
            return this.posts.find(post => post.id === id);
        }
        // return posts sorted (descending) by
        // publish date
        return this.posts.sort(function (a, b) {
            return b.publishDate - a.publishDate
        });
    },
    delete: function (id) {
        const postIndex = this.posts.findIndex(
            post => post.id === id);
        if (postIndex > -1) {
            this.posts.splice(postIndex, 1);
        }
    },
    update: function (updatedPost) {
        const {
            id
        } = updatedPost;
        const postIndex = this.posts.findIndex(
            post => post.id === updatedPost.id);
        if (postIndex === -1) {
            throw new StorageException(
                `Can't update item \`${id}\` because doesn't exist.`)
        }
        this.posts[postIndex] = Object.assign(
            this.posts[postIndex], updatedPost);
        return this.posts[postIndex];
    }
};

function createBlogPostsModel() {
    const storage = Object.create(BlogPosts);
    storage.posts = [];
    return storage;
}


module.exports = {
    BlogPosts: createBlogPostsModel()
};