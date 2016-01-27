Build Status: [![Circle CI](https://circleci.com/gh/librato/api-docs.svg?style=svg)](https://circleci.com/gh/librato/api-docs)

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

### Deployment 

This project is deployed via CircleCI each time a PR is merged into master. [Check Deploy status on CircleCI](https://circleci.com/gh/librato/api-docs/) 
