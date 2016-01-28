Build Status: [![Circle CI](https://circleci.com/gh/librato/api-docs/tree/master.svg?style=svg&circle-token=0882275f1f2469a4c707398ad01289c5f99b1e6a)](https://circleci.com/gh/librato/api-docs/tree/master)

# The Librato Api Docs

This is our API Docs site. It runs on Slate which is very easy to edit. The pages are hosted at
https://www.librato.com/docs/api

### About This Project

[Slate](https://github.com/tripit/slate) is a project designed to provide single page API documention using [Middleman](https://github.com/middleman/middleman). 

You can add/edit the docs using Markdown. CircleCI takes care of automating the process: anything that is merged into the master branch kicks off a build and is automagically shipped to production (hosted on S3).

### Setting up Slate for the First Time

#### You're going to need:

 - **Linux or OS X** — Windows may work, but is unsupported.
 - **Ruby, version 1.9.3 or newer**
 - **Bundler** — If Ruby is already installed, but the `bundle` command doesn't work, just run `gem install bundler` in a terminal.

#### Getting Set Up

 1. Fork this repository on Github.
 2. Clone *your forked repository* (not our original one) to your hard drive with `git clone git@github.com:librato/api-docs.git`
 3. `cd api-docs`
 4. Install all dependencies: `bundle install`
 5. Start the test server: `bundle exec middleman server`

Or use the included Dockerfile! (must install Docker first)

```shell
docker build -t api-docs .
docker run -d -p 4567:4567 --name api-docs -v $(pwd)/source:/app/source api-docs
```

You can now see the docs at <http://localhost:4567>.

*Note: if you're using the Docker setup on OSX, the docs will be
availalable at the output of `boot2docker ip` instead of `localhost:4567`.*

### Editing the Docs

All of the documentation can be edited in the Markdown files. In order to add content to the body, add a new file within the `/includes` folder with new content. You will need to also specify this file in the `includes` section within the main `index.md` file.

For example, within `/index.md` the section `- authentication` is at the top of the `includes:` section. It will reference the file `includes/_authentication.md`. Since this is referenced first in the list it will be appended just after the content in `index.md` when generating the single documentation page.

H1 tags (`#` in Markdown) are automatically added to the sidebar, and H2 tags (`##`) are automatically added as sub-menu items.

Learn more about [editing Slate markdown](https://github.com/tripit/slate/wiki/Markdown-Syntax).

### Deployment 

This project is deployed via CircleCI each time a PR is merged into master. [Check Deploy status on CircleCI](https://circleci.com/gh/librato/api-docs/) 
