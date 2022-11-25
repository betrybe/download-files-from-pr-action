const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios').default
const main = require('./main');

const BATCH_UPDATE_URL = 'https://api.betrybe.dev/content-object-service/external/v1/content_objects/validate_objects'

async function updateContentObjects(files, prNumber, owner, repo, actor) {
  core.info(`\u001B[34m[INFO] Updating Content Objects modifield on Pull Request ${prNumber}`)

  const repository = `${owner}/${repo}`
  const payload = { files, pr_number: prNumber, repository, github_username: actor }

  const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD
  const encodedUsernamePassword = Buffer.from(`squad_cursos:${basicAuthPassword}`).toString('base64')
  const headers = {'Authorization': `Basic ${encodedUsernamePassword}`}

  return await axios.post(BATCH_UPDATE_URL, payload, { headers })
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

    const files = await main.downloadFiles({
      client: new github.GitHub(token),
      owner,
      repo,
      ref,
      prNumber: parseInt(prNumber),
      log: (msg) => core.info(msg),
    });

    const response = await updateContentObjects(files, prNumber, owner, repo, actor)

    console.log(`Response: ${JSON.stringify(response)}`)

    if (response.status != 200) {
      core.setOutput('errors', response.data);
      core.setFailed(`[ERROR] Failed to update Content Objects: ${JSON.stringify(response)}`)
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run();
