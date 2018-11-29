Gatsby has been gaining so much traction for the past few months. When I was first introduced to Gatsby, there was only 3 official starters as well as a handful of others. Nowaday, we have a showcase of starters with many different combination of CMSs and UI libraries integration. Things are great and dandy, yet I still feel like something is missing. Having built several sites in Gatsby, I find myself installing the same packages, setting up page creation, or adding some configuration again and again. It's repetitive and tedious. There are rooms for improvement.

Recently, [Chris Biscardi](https://twitter.com/chrisbiscardi) from the Gatsby team introduced [Gatsby Theme](https://www.gatsbyjs.org/blog/2018-11-11-introducing-gatsby-themes/#why-themes), allowing users to reuse the same configuration across multiple sites. This definitely is a game changer for many people. It allows the already-exciting ecosystem of Gatsby starters to become even more reusable. It can also let newcomers to utilize Gatsby without much traction.

Super excited about the new feature, I've been playinng around with it for some time. Here is how you can get started with Gatsby Theme:

**NOTE**: _Theme is an experimental feature. You may want to consider that before using it for any serious project._

## What we're gonna build

We're going to set up a simple blog with Gatsby using markdown files. We can then make it into a theme. You will see how easy it will be for theme-user to leverage theme's functionality to create websites.

We'll also poke around some current pattern that theme developers can use to allow further customization from users.

## Set up the blog

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
gatsby new packages/gatsby-theme-tutorial https://github.com/gatsbyjs/gatsby-starter-hello-world
```

Let's create the blog post:

```md
<!-- in packages/gatsby-theme-tutorial/src/pages/post.md -->

---

title: "Hello World from Theme"
slug: "post"

---

Hi
```

Add some necessary packages to transform it into Gatsby data:

**NOTE**: _Also, make sure you're running at least Gatsby version 2.0.57._

```sh
# in packages/gatsby-theme-tutorial/
# let's also upgrade to the latest gatsby version at this time
yarn add gatsby@^2.0.57 gatsby-source-filesystem gatsby-transformer-remark
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
# in workspace root
yarn
yarn workspace gatsby-theme-tutorial start
```

If you can navigate to [localhost:8000/post](localhost:8000/post) and see this, everything is going well so far. 🎉

![a blank site with a title "Hello World from Theme"](./post-from-theme.png)

## Make it a theme

## Use it

Let's create another Gatsby site and consume the theme we just create. And yes, that's right. We didn't have to do anything special. At its core, a theme is just a regular Gatsby site.

```sh
# in workspace root

# since theme is just a Gatsby plugin, we need an index.js
touch packages/gatsby-theme-tutorial/index.js

gatsby new packages/blog https://github.com/gatsbyjs/gatsby-starter-hello-world

yarn workspace blog add gatsby-theme-tutorial@1.0.0
```

And create a blog post:

```md
<!-- in packages/gatsby-theme-tutorial/src/pages/hello.md -->

---

title: "Hello World from User"
slug: "hello"

---

Hello
```

Let's try and run it:

```sh
yarn workspace blog start
```

And voila:

![a blank site with a title "Hello World from User"](./post-from-user.png)

It's that easy!! Using themes, users can just focus on their content and don't have to worry about the code.

## Customization

### 1. Override UI components

As great as any theme can be, there will always be something that we want to change.

In this case, we're using an awesome theme already, but let's say we don't like the color of the title. This blue is not very good, and we want something better.

We can totally do this with ease with Component Shadowing. It's an awesome feature where we can create a component in our blog, and it'll override the corresponding component in the theme. All we need to do is creating a folder with the theme name (`gatsby-theme-tutorial`) under our `components` folder and putting the new-and-improved component there.

Let's recreate the title component then:

```jsx
// in packages/blog/src/components/gatsby-theme-tutorial/Title.js
// let's change the color from blue -> green

import React from "react"

function Title({ children }) {
  return <h1 style={{ color: "green" }}>{children}</h1>
}

export default Title
```

Save, and see the magic happens. Yes. It's that easy.

### 2. Override Gatsby template

Now, let's say we want to change the `PostTemplate`. We may need to change the layout of the page, or we may want to have some extra fields in our post. We can totally achieve all these like so:

In our `gatsby-node.js`, let's create a helper function that will:

1. Check if the user has a template that they wanna use
2. If yes, we'll use that template
3. If not, we'll use the theme's template

Here's how that function looks:

```js
// in packages/gatsby-theme-tutorial/gatsby-node.js

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
```

and use that helper function when creating the posts:

```js
// in packages/gatsby-theme-tutorial/gatsby-node.js

exports.createPages = ({ graphql, actions }) => {
  // ...

  createPage({
    path: slug,
    // component: path.resolve(__dirname, "src/templates/PostTemplate.js"), // highlight-line
    component: withThemePath("src/templates/PostTemplate.js"), // highlight-line
    context: { slug },
  })

  // ...
}
```

With this change, if the user has an override for `PostTemplate`, the theme will use it instead of its own template. Let's create it then:

```jsx
// in packages/blog/src/templates/PostTemplate.js

import React from "react"
import { graphql } from "gatsby"
import Title from "../components/gatsby-theme-tutorial/Title" // highlight-line

function PostTemplate({ data: { post } }) {
  return (
    <div>
      <Title>{post.frontmatter.title}</Title>
      {/* highlight-start */}
      <p>{post.frontmatter.description}</p>
      <hr />
      {/* highlight-end */}
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
        description # highlight-line
      }
    }
  }
`
```

**NOTE**: _To be frank, this doesn't seem like the best options yet since we'll have to copy-paste the original `PostTemplate` from the theme and adjust it. I believe we will be able to solve this problem in the future and come up with a more elegant solution. In the mean time, there are ways for themes developer to go around this with some API pattern. I'll elaborate more in future posts._

Don't forget to add the `description` field in our post:

```md
<!-- in packages/gatsby-theme-tutorial/src/pages/hello.md -->

---

title: "Hello World from User"
slug: "hello"
description: "This field is only available in userland." <!-- add description field -->

---

<!-- ... -->
```

This should do the trick. Try running the blog, and you should see:

![a blank site with a title "Hello World from User" with a description](./post-from-user-with-description.png)

And there you have it, a fully customizable theme. As you can see, using theme makes it super easy to get started and utilize all the functionality of the theme. At the same time, users are still in control of their website and have the ability to change and customize it as they see fit.

## Publish

Before publishing the theme to NPM, there is one last step we have to do. As we're not compiling the code of the theme when publishing, we have to instruct Gatsby to utilize the build process of users' site. Without doinng so, there may be errors when we utilize language features like JSX.

```js
// in packages/gatsby-theme-tutorial/gatsby-node.js

// ...

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
```

That's it. Your theme is now ready to be published and reused. You can find the code for this tutorial [here](https://github.com/alexluong/gatsby-theme-tutorial).

## Final thoughts

I'm super excited about the direction that Gatsby is going towards. After testing out Gatsby theme, I can see that it allows the theme developer full control of what to exposed to the users. But above all, it gives developers the ability to reuse functionality and configuration quickly without boilerplates.

Gatsby theme helps developers create blazing fast websites blazingly fast.
