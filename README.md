
<p align="center">
  <a href="https://github.com/betrybe/download-files-from-pr-action/actions"><img alt="javscript-action status" src="https://github.com/betrybe/download-files-from-pr-action/workflows/units-test/badge.svg"></a>
</p>

# GitHub Action: Download files from PR

A GitHub action that download modified files from specific _Pull Request_.

## Example usage

```yaml
steps:
  - name: Download files from PR
    uses: betrybe/download-files-from-pr-action@v3.0.0
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
      prNumber: ${{ github.event.number }}
```

## Inputs

This action accepts the following configuration parameters via `with:`

- `token`

  **Required**

  The GitHub token to use for making API requests

- `owner`

  **Default: `github.repo.owner`**

  The owner of the GitHub repository you want to download files

- `repo`

  **Default: `github.repo.repo`**

  The name of the GitHub repository you want to download files

- `ref`

  **Required**

  **Default: `github.sha`**

  The Git ref of the commit you want to download files

- `prNumber`

  **Required**

  The Pull Request number you want do download files

- `storagePath`

  **Required**

  **Default: "tmp"**

  Local path to store downloaded files

- `filterPath`

  Filter files to be downloaded by path

## Outputs

- `encodedRemovedFilenames`

  Encoded Base64 string that contains the name of the removed files.

  After decoding the array should be something like this:
  ```json
  ["filename1.json", "content/name.md", "/static/images/play.png"]
  ```

# Create a JavaScript Action

Use this template to bootstrap the creation of a JavaScript action.:rocket:

This template includes tests, linting, a validation workflow, publishing, and versioning guidance.

If you are new, there's also a simpler introduction.  See the [Hello World JavaScript Action](https://github.com/actions/hello-world-javascript-action)

## Create an action from this template

Click the `Use this Template` and provide the new repo details for your action

## Code in Master

Install the dependencies
```bash
$ npm install
```

Run the tests :heavy_check_mark:
```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```

## Change action.yml

The action.yml contains defines the inputs and output for your action.

Update the action.yml with your name, description, inputs and outputs for your action.

See the [documentation](https://help.github.com/en/articles/metadata-syntax-for-github-actions)

## Change the Code

Most toolkit and CI/CD operations involve async operations so the action is run in an async function.

```javascript
const core = require('@actions/core');
...

async function run() {
  try {
      ...
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
```

See the [toolkit documentation](https://github.com/actions/toolkit/blob/master/README.md#packages) for the various packages.

## Package for distribution

GitHub Actions will run the entry point from the action.yml. Packaging assembles the code into one file that can be checked in to Git, enabling fast and reliable execution and preventing the need to check in node_modules.

Actions are run from GitHub repos.  Packaging the action will create a packaged action in the dist folder.

Run package

```bash
npm run package
```

Since the packaged index.js is run from the dist folder.

```bash
git add dist
```

## Create a release branch

Users shouldn't consume the action from master since that would be latest code and actions can break compatibility between major versions.

Checkin to the v1 release branch

```bash
$ git checkout -b v1
$ git commit -a -m "v1 release"
```

```bash
$ git push origin v1
```

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Usage

You can now consume the action by referencing the v1 branch

```yaml
uses: betrybe/download-files-from-pr-action@v3.0.0
with:
  token: 'my-token'
  owner: 'my-org'
  repo: 'my-repo'
  prNumber: '34'
  storagePath: 'tmp/my'
```

See the [actions tab](https://github.com/betrybe/download-files-from-pr-action/actions) for runs of this action! :rocket:
