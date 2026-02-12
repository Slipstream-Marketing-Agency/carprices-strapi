module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/article-comments',
            handler: 'article-comment.find',
            config: {
                auth: false,
            },
        },
        {
            method: 'POST',
            path: '/article-comments',
            handler: 'article-comment.create',

        },
    ],
};
