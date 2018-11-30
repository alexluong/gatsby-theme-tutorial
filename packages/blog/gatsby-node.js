const path = require("path")

exports.onCreatePage = ({ page, actions }) => {
  const { createPage, deletePage } = actions

  return new Promise(resolve => {
    // Check if this page is a post page created by theme "gatsby-theme-tutorial"
    if (
      page.component.includes("gatsby-theme-tutorial") &&
      page.component.includes("PostTemplate")
    ) {
      deletePage(page)
      createPage({
        ...page,
        component: path.resolve(__dirname, "src/templates/PostTemplate.js"), // Replacement template
      })
    }

    resolve()
  })
}
