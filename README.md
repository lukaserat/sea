# Swagger + Express + AJV Boilerplate = SEA

A validation-driven API Devleopment with namespacing.

The aim of this is to speedup API development by utilizing JSON Schema for validating request and Swagger UI for following OAS standard.

Disclaimer: Currently work in progress.

## Why SEA?

A good practice in REST API development is to follow the OAS or Open API Specification standard. Read more [here](https://github.com/OAI/OpenAPI-Specification).

OAS or formerly known as Swagger Specification is a community-driven open specification that defines standard, programming language-agnostic interface for [RES APIs.](https://en.wikipedia.org/wiki/Representational_state_transfer)

Following OAS will help you utilize related tools under OAS innovation like Swagger Editor or the popularly known standalone API Explorer, [Swagger UI.](https://swagger.io/docs/open-source-tools/swagger-ui/usage/installation/)

Having Swagger UI in placed instantly prepare things for an API Explorer like [this](https://petstore.swagger.io/). With this, it let you focus more on your API development.


## Application Concept

Request Life Cycle

```
Request(Request Model)
      → Core Middleware (Before)
      → Application Middleware
      → Product[Sample Namespace] Middleware
      → Request(Model & Parameter) Validation
      → Controller(Handler)
      → Core Middleware (After) → Response(ResponseModel)
```

Validation Container

```
              Application Models
                      ↓
   Core Models →  Container ← Namespace Models
```

Routes
```
  Route Container → [RouteConfig]

  RouteConfig → Method - GET, POST, DELETE, or PUT
              → Path
              → Middleware
              → RequestBody - Request Models
              → Parameters
              → Handler - Controller
              → Tags
              → Summary
              → Responses - Response Models
```

Swagger UI
```
   Route Container
  __________________
  | RouteConfig[   |
  |   Prefix,      |
  |   Responses,   |  Models(Core, Application, Namespace)
  |   Summary,     |           ↓
  |   Tags,        | →  Core Definition ← Tags(Core, Application, Namespace)
  |   RequestBody, |
  |   Parameters,  |
  |   Path         |
  | ]              |
```

## Folder Structure

### Core Level

```
 + App
 + Constants
 + Swagger
 + Validator
```

**App**

Houses the concept of having one Application instance that will
setup/configure and run it using the written definition.

This is where the namespace/product instance is patterned.

**Constants**

Houses the constants that can be use down to product/namespace instances.

**Swagger**

Houses the Swagger logic. It is coded independently from the App for reusability.

**Validator**

Same with swagger, coded independently. Houses Validation logic by just extending the AJV functionalities.


### Application Level

```
 + products
 + swagger
 + validator
 . definition.js
 . index.js
 . routes.js
 . package.json
 ..
```

**Products**

The namespace folder. It can house multiple products/namespace.

**Validator**

Houses the application level validation configurations for the following:

* Schemas - JSON Schemas that will be use for validating non-API related validations
* Keywords - [custom ajv keywords](https://www.npmjs.com/package/ajv#defining-custom-keywords)

**Swagger**

Houses the tags and model definitions that will be use in constructing the `swagger.json` which will be feed to the standalone **swagger ui explorer**.

**definition.js**

The javascript file that defines the instance of the Application.

**routes.js**

Holds the route configuration for application level.

**index.js**

The application entry file.

### Product/Namespace Level

```
 + products
 | - product1
 | - + swagger
 | - + routes.js
 ..
```

**Swagger**

Houses tags and model definitions for namespace/product level.

**routes.js**

Holds the route configuration for namespace/product level.


## How to's

### Create a project/module

Using @viseo/sea generator
```
$ seagen
```

Or by copying the mod-template and update its content that will correspond to your products.
```
$ cp mod-template mod-new-module
```

### Adding and Removing a product

Turning on and off of a product depend on two things

* Environment variable name `PRODUCTS` - product must be listed here
* Product files - product should have corresponding required product files under `./src/products` folder.

Product files are the following:

* swagger/index.js - needed for swagger ui definition
* swagger/model.js - required in swagger/index.js for defining product level models.
* swagger/tags.js - required in swagger/index.js for defining product level tags.
* routes.js - required in API and swagger ui definition.

## References

* [JSON Schema](https://cswr.github.io/JsonSchema/)
* [AJV](https://www.npmjs.com/package/ajv)
* [Defining Custom Keywords(keywords.js)](https://www.npmjs.com/package/ajv#defining-custom-keywords)
* Defining Swagger UI [Response](https://swagger.io/docs/specification/describing-responses/) and [Schema Models](https://swagger.io/docs/specification/data-models/)