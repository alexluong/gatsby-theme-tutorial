import React from "react"
import { graphql } from "gatsby"
import PostTemplateRenderer from "../components/gatsby-theme-tutorial/PostTemplateRenderer"

export default props => <PostTemplateRenderer {...props} />

export const pageQuery = graphql`
  query($slug: String!) {
    post: markdownRemark(frontmatter: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        description
      }
    }
  }
`
