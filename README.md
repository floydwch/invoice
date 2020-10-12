# An Assessment Project

## What's included

### Technologies

- A micro-service oriented project orchestrated by Docker Compose.
- Rails API server and backend logic with GraphQL API.
- Next.js UI server (Universal JavaScript application) with TypeScript, React, Styled-components, and Apollo Client for GraphQL.
- Elasticsearch for full-text search.
- A gateway powered by Traefik.

### Features

- The user is able to browse through the line-item data as a table with infinite-scrolling.
- The user is able to edit line-item "adjustments".
- The user is able to see each line-item's billable amount (sub-total = actuals + adjustments).
- The user is able to see sub-totals grouped by campaign (line-items grouped by their parent campaign).
- The user is able to see the invoice grand-total (sum of each line-item's billable amount).
- The user is able to sort the data.
- The user is able to flag individual line-items as "reviewed" (meaning they are disabled from further editing).
- The user is able to flag "campaigns" as being reviewed, as well.
- The user is able to filter the data (ie. by campaign name, etc., should affect the grand-total).
- The user is able to share and reuse filters between users.

## How to see the result

To run the project as production mode:

First, start the services with Docker Compose:

`docker-compose up`

If it's the first time to start the services, you have to setup the database when the docker-compose is ready. It will take a few minutes to import the seed into the database and create the index for Elasticsearch. Please open another terminal and input:

`docker-compose exec api rails db:setup`

After the services are started and the database is setup, go to [http://localhost:3000](http://localhost:3000) to see the result.

## Purpose

### Production perspective

This project values intuition and simplicity. Its feature set consists of displaying, editing, filtering and pagination of a non-small dataset which is also simple in the meanwhile. To achieve the simplicity, this project chooses to make every action synchronize to the server automatically just like a desktop software which means user doesn't need to push a confirm button to update an adjustments value or use an indirect button to change the state for starting a action.

The dataset has some wide float numeral columns, and it supposed to be important for its integrity. There are different methods can be used to represent a wide column, such as making the column adjustable, making the column scrollable, breaking the cell into multi-lines, or making a scrollable large table.

To reduce the needed actions on exploring the rows, this project chooses to make a large table with large and fixed columns, it's kind of progressive design that when user uses this product on a large screen, it displays all columns, or it let user scroll to explore the columns on a small screen.

The dataset consists of line-items, and each line-item belongs to a campaign, and there are requirements of group actions on campaigns. This project supposes the line-item itself is meaningful for the users, i.e., user would like to check the line-item directly outside a campaign, it is also a loose hypothesis that in contrast to making each line-item embedded in a campaign first. Without loss of functionality, the product lets user group the line-item with its campaign by providing a filter via a link.

Since the dataset is large enough to paginate, the decision of pagination should be made. To reduce the operations, this project chooses infinite-scroll pagination because it seems not to matter the index of the page. To eliminate the necessary of remembering names of columns when user scrolls the table, the product also provides a float header for the information.

### Technical perspective

Several emerging technologies are employed in this project, such as GraphQL, TypeScript, and micro-service architecture. The decision is aim to establish the product with a scalable architecture in software engineering and leverage the best part of each technology as well as keep the thing simple yet powerful without too much magic.

Usually, a Rails project uses its builtin mechanism to manage the frontend, e.g., asset pipeline or webpacker. However, the technology development on the frontend world is progressing rapidly. Rails itself has to make decisions on how to adopt these emerging technologies/ideas, and it would have some time gaps and leaky abstractions.

Micro-service architecture with Universal JavaScript application can be a rescue. Since Rails has an API-mode, we can use Rails as an API server, and use technology from frontend world to build the frontend application instead of Rails's template and router.

Several benefits can be taken from this approach. The UI part is made up of JavaScript/TypeScript modules, CSS and HTML. If the project chooses React to build its UI, React's JSX is overlapping with Rails's template. Just use React with Next.js instead of Rails's template can easily earn the interoperability such as dynamic routing and loading without a browser reload in the client runtime.

GraphQL is another emerging technology in this project. It provides the functionality to implement a typed and composable API. With its type-checking, we can avoid writing ad-hoc codes to check the type of data in contrast to RESTFul. Since it's composable and shapeable, we can avoid writing ad-hoc endpoints, focus on the query modeling, and let the frontend decide which fields are needed which reduces communication efforts.

On styling, this project uses Styled-components to author the style which is a CSS-in-JS approach. We can benefit from its interoperability between JavaScript and CSS such as reducing the time to name CSS classes and the capability to inject variables into CSS. It's also useful when there is a need to implement dynamic CSS animations.

Gateway or reversed proxy is also an important decision should be made in a micro-service oriented project. This project chooses Traefik instead of Nginx because it's a container-aware technology. We can configure Traefik directly on Docker Compose without hassle in contrast to Nginx which needs customized configs and a setup script. [Its performance is also comparable to Nginx](https://www.loggly.com/blog/benchmarking-5-popular-load-balancers-nginx-haproxy-envoy-traefik-and-alb/).

## Key aspects for review

- Frontend endpoint: `web/pages/index.tsx`
- Frontend global: `web/pages/_app.js`
- Frontend components: `web/components/`
- Frontend GraphQL queries: `web/queries/`
- Backend GraphQL implementation: `api_server/app/graphql/types/{line_item_type, campaign_type, query_type, mutation_type}.rb`, `api_server/app/graphql/mutations/`
- Service orchestration: `docker-compose.yml`

## Conclusion

This assessment project demonstrates how to build a simple data dashboard with modern/trendy web technologies.
