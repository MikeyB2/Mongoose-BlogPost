const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
    content: 'string'
});

const authorSchema = mongoose.Schema({
    firstName: 'string',
    lastName: 'string',
    userName: {
        type: 'string',
        unique: true
    }
});

authorSchema.methods.serialize = function () {
    return {
        id: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        userName: this.userName
    };
};

const blogPostSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    // add the author schema to reference the author so that we can tie the author to their blogposts tieing the ref to your database
    author: {
        firstName: String,
        lastName: String
    },
    entry: {
        type: Date,
        default: Date.now
    },
    comments: [commentSchema]
});

blogPostSchema.pre('find', function (next) {
    this.populate('author');
    next();
});

blogPostSchema.pre('findOne', function (next) {
    this.populate('author');
    next();
})

blogPostSchema.virtual("authorName").get(function () {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostSchema.methods.serialize = function () {
    return {
        id: this._id,
        title: this.title,
        content: this.content,
        author: this.authorName,
        entry: this.entry,
        comments: this.comments
    };
};




// tie the database in the first "" part of the method
const Author = mongoose.model('authors', authorSchema);
const BlogPost = mongoose.model("blogposts", blogPostSchema);



module.exports = {
    Author,
    BlogPost
};