# Live Demo 

## Don't be shy 
[Click here](https://noel-chinaza.github.io/demo3D/index.html#) to interact with a live demo of this plugin in your browser

However, keep in mind that the names are randomized in this demo for obvious reasons

# Project Brief
Demo3D is an ORGINAL 3D plugin that was developed as an intuitive module to facilitate an organization in distributing real estate amongst it's tenants
This repository isn't the full source but the compiled source giving the public an insight into a demonstration of the functionality of the plugin

The solution accounted for the following features:

* intuitive navigation around the facility
* knowing what user was in a given unit
* exporting metadata for database seeding

# Implementation Summary
The project utilized OOP design principles, each of the mall types and configuration extend a base class; said base class is responsible for handling animations between floor levels
The extensions of the base class each define how they draw/map out the floor paln and the respective units on the given floor plan


# Screenshots

| Levels of a single mall | All malls in the facility |
| ------------------ | --------------- |
|![](/previews/abc_levels.png)|![](/previews/facility_plan.png)

| Levels of another mall | A single floor plan |
| ------------------ | --------------- |
|![](/previews/kee_klamp_levels.png)|![](/previews/floor_plan.png)



Every unit is color coded to represent the availability status of that unit

* units are priced differently and are colored differently as an indication of the eype of the unit
* black colored units are those that have been sold to a particular tenant, clicking on the unit reveals the name of the tenant
* greyed out units are reserved for one of many reasons

For more instructions, consider reading the HELP section in the live demo


# Design tools

* Affinity Designer

# Stack

* Typescript
* [Anime JS](https://www.npmjs.com/package/animejs)
* [Panzoom](https://www.npmjs.com/package/panzoom)
* [Raphael JS](https://www.npmjs.com/package/raphael)

# Credits

[Noel Ama](https://www.linkedin.com/in/noel-ama/) the lone multifaceted software engineer who built out this solution

[Mary Lou's work](https://tympanus.net/Development/Interactive3DMallMap/) served as the initial fork for this project which was reasonably overhauled in order to deliver an intuitive business solution

