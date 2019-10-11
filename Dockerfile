# A container that has Middleman/Slate and a webserver that serves the docs locally.
# Usage: build the container:
#   $ docker build -t api-docs .
#
# Serve the docs locally on port 4567:
#   $ docker run -d -p 4567:4567 --name api-docs -v $(pwd)/source:/app/source api-docs
#
# You should now be able to see the docs at http://localhost:4567.

FROM ruby:2.3.1

RUN apt-get update
RUN apt-get install -yq build-essential git nodejs
RUN gem install bundler
ADD Gemfile /app/Gemfile
ADD Gemfile.lock /app/Gemfile.lock
RUN cd /app; bundle install
ADD . /app
EXPOSE 4567
WORKDIR /app
CMD ["bundle", "exec", "middleman", "server"]
