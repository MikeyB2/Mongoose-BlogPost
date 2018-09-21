const mongoose = require("mongoose");

const blogPostSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        firstName: String,
        lastName: String,
    },
    entry: {
        type: Date,
        default: Date.now
    }
});


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
const BlogPost = mongoose.model("posts", blogPostSchema);

module.exports = {
    BlogPost
};