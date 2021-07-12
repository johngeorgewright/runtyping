# @johngeorgewright/ts-module

This is a template repository for creating a NPM package with TypeScript.

## Setting up

1. Change all references of `@johngeorgewright/ts-module` to your new package name
1. Also search for references to `@johngeorgewright` & `ts-module` individually
1. Remove the `private` property from `package.json` (if you want to publically publish your module)
1. Search for all references of `secrets.` in the `.github` diectory and make sure you have the appropriate secrets registered in GitHub (Your Repo > Settings > Secrets)

## I'm not interesting in the zero installation / Yarn / PnP thing. I'd prefer to use NPM.

1. When using this template choose to include **all** the branches
1. Clone your project
1. Use the `npm` branch: `git checkout npm`
1. Delete the `master` branch: `git branch -D master`
1. Recreate the master branch with the npm branch: `git checkout -b master`
1. Delete the `npm` branch: `git branch -D npm`
1. Force push your changes: `git push origin master -f`
1. And delete the npm branch on the remote: `git push origin :npm`

Now follow the steps in "Setting up".
