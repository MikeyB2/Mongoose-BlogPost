const mongoose = require("mongoose");

const authorSchema = mongoose.Schema({
    firstName: 'string',
    lastName: 'string',
    userName: {
        type: 'string',
        unique: true
    }
});

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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'authors'
    },
    entry: {
        type: Date,
        default: Date.now
    }
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
        entry: this.entry
    };
};



// tie the database in the first "" part of the method
const Author = mongoose.model('authors', authorSchema);
const BlogPost = mongoose.model("blogposts", blogPostSchema);


module.exports = {
    Author,
    BlogPost

};