Gatsby has been gaining so much traction for the past few months. When I was first introduced to Gatsby, there was only 3 official starters as well as a handful of others. Nowaday, we have a showcase of starters with many different combination of CMSs and UI libraries integration. Things are great and dandy, yet I still feel like something is missing. Having built several sites in Gatsby, I find myself installing the same packages, setting up page creation, or adding some configuration again and again. It's repetitive and tedious. There are rooms for improvement.

Recently, Chris Biscardi from the Gatsby team introduced Gatsby Theme, allowing users to reuse the same configuration across multiple sites. This definitely is a game changer for many people. It allows the already-exciting ecosystem of Gatsby starters to become even more reusable. It can also let newcomers to utilize Gatsby without much traction.

Super excited about the new feature, I've been playinng around with it for some time. Here is how you can get started with Gatsby Theme:

**NOTE: Theme is an experimental feature. You may want to consider that before using it for any serious project.**

## What we're gonna build

We're going to set up a simple blog with Gatsby using markdown files. We can then make it into a theme. You will see how easy it will be for theme-user to leverage theme's functionality to create websites.

We'll also poke around some current pattern that theme developers can use to allow further customization from users.

## Initial set up

I'll speed through the initial set up of the blog as I assume you are already familiar with Gatsby.

First, we'll use Yarn Workspaces to set this up. Let's create a new directory and set up our workspace:

```sh
mkdir gatsby-theme-tutorial
cd gatsby-theme-tutorial
```

```json
// in package.json
{
  "name": "gatsby-theme-tutorial",
  "version": "1.0.0",
  "license": "MIT",
  "private": true,
  "workspaces": ["packages/*"]
}
```

We'll start from `gatsby-starter-hello-world`.

```sh
mkdir packages
cd packages
gatsby new gatsby-theme-tutorial https://github.com/gatsbyjs/gatsby-starter-hello-world
```

Let's create the blog post:

```md
[//]: # "in packages/gatsby-theme-tutorial/src/pages/post.md"

---

title: "Hello World from Theme"
slug: "post"

---

Hi
```

Add some necessary packages to transform it into Gatsby data

```sh
# in packages/gatsby-theme-tutorial/
# let's also upgrade to the latest gatsby version at this time
yarn add gatsby@^2.0.55 gatsby-source-filesystem gatsby-transformer-remark
```

```js
// in packages/gatsby-theme-tutorial/gatsby-config.js

module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: "src/pages",
        name: "pages",
      },
    },
    "gatsby-transformer-remark",
  ],
}
```

Now let's turn markdown files into a page on our blog:

```js
// in packages/gatsby-theme-tutorial/gatsby-node.js

const path = require("path")

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
            component: path.resolve(__dirname, "src/templates/PostTemplate.js"),
            context: { slug },
          })
        })
      }),
    )
  })
}
```

```jsx
// in packages/gatsby-theme-tutorial/src/templates/PostTemplate.js

import React from "react"
import { graphql } from "gatsby"
import Title from "../components/Title"

function PostTemplate({ data: { post } }) {
  return (
    <div>
      <Title>{post.frontmatter.title}</Title>
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
      }
    }
  }
`
```

```jsx
// in packages/gatsby-theme-tutorial/src/components/Title.js

import React from "react"

function Title({ children }) {
  return <h1 style={{ color: "blue" }}>{children}</h1>
}

export default Title
```

That should be it for the blog. Let's try and see if it's working:

```sh
# in the root directory of the workspace
yarn
yarn workspace gatsby-theme-tutorial start
```

If you can navigate to `localhost:8000/post` and see this, everything is going well so far. 🎉

![blog](./sample-blog.png)
