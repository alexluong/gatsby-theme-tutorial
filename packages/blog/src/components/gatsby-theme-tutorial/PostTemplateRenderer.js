import React from "react"
import Title from "./Title"

function PostTemplateRenderer({ data: { post } }) {
  return (
    <div>
      <Title>{post.frontmatter.title}</Title>
      <p>{post.frontmatter.description}</p>
      <hr />
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </div>
  )
}

export default PostTemplateRenderer
