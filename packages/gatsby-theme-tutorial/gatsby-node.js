const path = require("path")

function withThemePath(relativePath) {
  let finalPath

  try {
    // Check if the user's site has the file
    // path.resolve returns the absolute path
    // relative to process.cwd()
    let pathResolvedPath = path.resolve(relativePath)
    require.resolve(pathResolvedPath)
    finalPath = pathResolvedPath
  } catch (e) {
    try {
      // If the user hasn't implemented the file,
      // require.resolve is relative to this file
      finalPath = require.resolve(relativePath)
    } catch (e) {
      // If we don't have the file also
      // we're doing something wrong then
      console.log(e)
      finalPath = relativePath
    }
  }

  return finalPath
}

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  return new Promise(resolve => {
    resolve(
      graphql(
        `
          {
            posts: allMarkdownRemark {
              edges {
                node {
                  frontmatter {
                    slug
                  }
                }
              }
            }
          }
        `,
      ).then(({ data: { posts } }) => {
        posts.edges.map(({ node: { frontmatter: { slug } } }) => {
          createPage({
            path: slug,
            component: withThemePath("./src/templates/PostTemplate.js"),
            context: { slug },
          })
        })
      }),
    )
  })
}

// Let Webpack know how to process files
exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.js$/,
          include: path.dirname(require.resolve("gatsby-theme-tutorial")),
          use: [loaders.js()],
        },
      ],
    },
  })
}
