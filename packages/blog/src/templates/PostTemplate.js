import React from "react"
import { graphql } from "gatsby"
import Title from "../components/gatsby-theme-tutorial/Title"

function PostTemplate({ data: { post } }) {
  return (
    <div>
      <Title>{post.frontmatter.title}</Title>
      <p>{post.frontmatter.description}</p>
      <hr />
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </div>
  )
}

export default PostTemplate

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
