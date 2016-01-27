Api Docs
========

This is our API Docs site. It runs on Slate which is very easy to edit. The pages are hosted at
https://www.librato.com/docs/api

### Prerequisites

You're going to need:

 - **Linux or OS X** — Windows may work, but is unsupported.
 - **Ruby, version 1.9.3 or newer**
 - **Bundler** — If Ruby is already installed, but the `bundle` command doesn't work, just run `gem install bundler` in a terminal.

### Getting Set Up

 1. Fork this repository on Github.
 2. Clone *your forked repository* (not our original one) to your hard drive with `git clone https://github.com/YOURUSERNAME/slate.git`
 3. `cd api-docs-rewrite`
 4. Install all dependencies: `bundle install`
 5. Start the test server: `bundle exec middleman server`

Or use the included Dockerfile! (must install Docker first)

```shell
docker build -t api-docs-rewrite .
docker run -d -p 4567:4567 --name api-docs-rewrite -v $(pwd)/source:/app/source api-docs-rewrite
```

You can now see the docs at <http://localhost:4567>.

*Note: if you're using the Docker setup on OSX, the docs will be
availalable at the output of `boot2docker ip` instead of `localhost:4567`.*

### Editing

In order to add content to the body, add a new file within the `/includes` folder with new content. You will need to also specify this file in the `includes` section within the main `index.md` file.

H1 tags (`#` in Markdown) are automatically added to the sidebar, and H2 tags (`##`) are automatically added as sub-menu items.

Learn more about [editing Slate markdown](https://github.com/tripit/slate/wiki/Markdown-Syntax), or [how to publish your docs](https://github.com/tripit/slate/wiki/Deploying-Slate).

### Publishing to Github Pages

 1. Commit your changes to the markdown source: `git commit -a -m "Update index.md"`
 2. Push the *markdown source* changes to Github: `git push origin master`
 3. Compile to HTML, and push the HTML to Github pages (which is hosted on the gh-pages branch): `rake publish`

Done! Your changes should now be live on http://librato.github.io/api-docs-rewrite/, and the main branch should be updated with your edited markdown. It can sometimes take a few minutes before your content is available online.

### Publishing Your Docs to Your Own Server

Instead of using `rake publish`, use `rake build`. Middleman will build your website to the `build` directory of your project, and you can copy those static HTML files to the server of your choice.

Another alternative is to use the [middleman-deploy](https://github.com/middleman-contrib/middleman-deploy) gem. 

### Custom Domains with Github

If you're hosting on Github Pages, just follow the instructions [in Github's help center](https://help.github.com/articles/setting-up-a-custom-domain-with-github-pages/). Note that instead of putting the `CNAME` file in the root directory of your Slate, you should put it in the `source` folder. When Middleman publishes to the `gh-pages` branch, it will copy it to the root folder of that branch.
