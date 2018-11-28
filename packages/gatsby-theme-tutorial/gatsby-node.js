const path = require("path")
const fs = require("fs")
const pkg = require("./package.json")
const { withThemePath } = require("gatsby-theme")

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
            component: withThemePath("src/templates/PostTemplate.js"),
            context: { slug },
          })
        })
      }),
    )
  })
}

// exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
//   actions.setWebpackConfig({
//     module: {
//       rules: [
//         {
//           test: /\.js$/,
//           include: path.dirname(require.resolve("gatsby-theme-tutorial")),
//           use: [loaders.js()],
//         },
//       ],
//     },
//   })
// }

exports.onCreateWebpackConfig = ({ actions }) => {
  // This is the folder that the replacement components will sit
  const themePrefix = `${pkg.name}-component-replacement--components`
  const userComponentsDir = path.resolve(`./src/components/${themePrefix}`)

  const userComponents = {}

  // Check if user wants to set up components replacements
  if (fs.existsSync(userComponentsDir)) {
    fs.readdirSync(userComponentsDir).forEach(fileName => {
      // Remove ext (.js) from file name
      const componentName = fileName.slice(0, fileName.lastIndexOf("."))

      userComponents[`${themePrefix}/${componentName}`] = path.resolve(
        `./src/components/${themePrefix}/${fileName}`,
      )
    })
  }

  actions.setWebpackConfig({
    resolve: {
      alias: {
        // Alias order matters. User's first; fallback second
        ...userComponents,
        [themePrefix]: path.join(__dirname, "./src/components"),
      },
    },

    // Let Webpack know how to process files
    module: {
      rules: [
        {
          test: /\.js$/,
          include: path.dirname(require.resolve(pkg.name)),
          use: [loaders.js()],
        },
      ],
    },
  })
}
