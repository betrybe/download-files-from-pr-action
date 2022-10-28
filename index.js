const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios').default
const main = require('./main');

const BATCH_UPDATE_URL = 'https://content-object-service-preview-app-142.betrybe.dev/content-object-service/external/v1/content_objects/batch_update'

async function updateContentObjects(files, prNumber, repo, actor) {
  core.info(`\u001B[34m[INFO] Updating Content Objects modifield on Pull Request ${prNumber}`)

  return await axios.put(BATCH_UPDATE_URL, { files, pr_number: prNumber, repository: repo, github_username: actor })
    .then(async (response) => {
      core.info('\u001B[34m[INFO] Content Objects updated successfully ✓')
      return { status: response.status, data: response.data }
    })
    .catch(async (error) => ({ status: error.response.status, data: error.response.data }))
}

async function run() {
  try {
    const token = core.getInput('token', { required: true });
    const owner = core.getInput('owner') || github.context.repo.owner;
    const repo = core.getInput('repo') || github.context.repo.repo;
    const actor = github.context.actor;
    const ref = core.getInput('ref') || github.context.sha;
    const prNumber = core.getInput('prNumber', { required: true });
    const filterPath = core.getInput('filterPath') || '';

    const files = await main.downloadFiles({
      client: new github.GitHub(token),
      owner,
      repo,
      ref,
      prNumber: parseInt(prNumber),
      filterPath,
      log: (msg) => core.info(msg),
    });

    const response = await updateContentObjects(files, prNumber, repo, actor)

    console.log(`Response: ${JSON.stringify(response.data)}`)

    if (response.status != 200) {
      core.setFailed(`[ERROR] Failed to update Content Objects: ${JSON.stringify(response.data)}`)
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run();
