/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/no-array-index-key */

import React from "react"
import { Link } from "react-router-dom"
import ReactHtmlParser from "react-html-parser"

export default function BlogSection(props) {
  const fromBlog = props.blogs
  return (
    <div className="community-section">
      <div className="community-head">
        {fromBlog.title_h2 && <h2>{fromBlog.title_h2}</h2>}
        {fromBlog.view_articles && (
          <Link
            to={fromBlog.view_articles.href}
            className="btn secondary-btn article-btn"
          >
            {fromBlog.view_articles.title}
          </Link>
        )}
      </div>
      <div className="home-featured-blogs">
        {fromBlog.featured_blogs.map((blog, index) => (
          <div className="featured-blog" key={index}>
            {blog.featured_image && (
              <img
                src={blog.featured_image.url}
                alt={blog.featured_image.filename}
                className="blog-post-img"
              />
            )}
            <div className="featured-content">
              {blog.title && <h3>{blog.title}</h3>}
              {blog.body && ReactHtmlParser(blog.body.slice(0, 300))}
              {blog.url && (
                <Link href={blog.url} passHref>
                  <a className="blogpost-readmore">{"Read More -->"}</a>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
