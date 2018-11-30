import React from "react"
import { graphql } from "gatsby"
import PostTemplateRenderer from "../components/PostTemplateRenderer"

export default props => <PostTemplateRenderer {...props} />

export const pageQuery = graphql`
  query($slug: String!) {
    post: markdownRemark(frontmatter: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
      }
    }
  }
`
