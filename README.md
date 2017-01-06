Build Status: [![Circle CI](https://circleci.com/gh/librato/api-docs/tree/master.svg?style=svg&circle-token=0882275f1f2469a4c707398ad01289c5f99b1e6a)](https://circleci.com/gh/librato/api-docs/tree/master)

# The Librato Api Docs

This is our API Docs site. It runs on Slate which is very easy to edit. The pages are hosted at
https://www.librato.com/docs/api

Note for Legacy branch: This branch is an archive of API documentation up until 12/20/2016. After making changes, run
`./deploy.sh` locally to automatically generate and deploy the static site to Github Pages (hosted on the gh-pages
branch).

### About This Project

[Slate](https://github.com/tripit/slate) is a project designed to provide single page API documentation using [Middleman](https://github.com/middleman/middleman).

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

*Note: if you're using the Docker setup on OSX, the docs may be
availalable at the output of `local.docker:4567` instead of `localhost:4567`.*

### Editing the Docs

All of the documentation can be edited in the Markdown files. In order to add content to the body, add a new file within the `/includes` folder with new content. You will need to also specify this file in the `includes` section within the main `index.md` file.

For example, within `/index.md` the section `- authentication` is at the top of the `includes:` section. It will reference the file `includes/_authentication.md`. Since this is referenced first in the list it will be appended just after the content in `index.md` when generating the single documentation page.

Learn more about [editing Slate markdown](https://github.com/tripit/slate/wiki/Markdown-Syntax).

#### Sidebar

H1 tags (`#` in Markdown) are automatically added to the sidebar, and H2 tags (`##`) are automatically added as sub-menu items.

Generally H2 tags are only used for CRUD (create/retrieve/update/delete) of an object, but other high priority sections can be added to H2 as well (eg. Pagination, List all Metrics).

#### Center Column

The center column is used for all API documentation other than examples (which are reserved for the right column).

* To highlight code in this column you can simply surround your code with backticks (``).

* You can add a notice with the following HTML:

```html
<aside class="notice">Note: Blah blah....</aside>
```

* Tables should be used when describing object properties. Here is an example of building a 2 column 3 row table:

```
Property | Definition
-------- | ----------
start_time | Unix Time of where to start the time search from. This parameter is optional if duration is specified.
end_time | Unix Time of where to end the search. This parameter is optional and defaults to current wall time.
resolution<br>`required` | Defines the resolution to return the data to in seconds.
```

#### Right Column

The right column is reserved for examples. To add examples to the right of a H1, H2, or H3 section, place the example code just below the header title. In order for examples to load on the right column, sentences will need to start with a `>` or code blocks will need to be surrounded by 3 backticks. Text which you wish to have read in the center column should come just after the example code.

eg.
```
### Metric Measurement Queries

>Retrieve all metrics containing `request` in the metric name:

``shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics?name=request'
``

Center column text here
```


In the example above, notice how '>' is used for any text you want to add in the example section, while 3 backticks around your codeblock will add syntax highlighting and set the code to the right column. You should specify `shell` (cURL), `ruby`, and `python` after the opening backticks to specify the type of syntax highlighting that should be used.

You can also add code highlighting to specific words in the examples section by adding single backticks around the word(s). This is used mainly for highlighting object properties.

eg.
```
>Retrieve all metrics containing `request` in the metric name:
```

### Deployment

This project is deployed via CircleCI each time a PR is merged into master. [Check Deploy status on CircleCI](https://circleci.com/gh/librato/api-docs/)
