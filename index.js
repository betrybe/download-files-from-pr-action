const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios').default
const main = require('./main');

const environment = core.getInput('environment');

console.log('[environment]', environment);

const apiDomains = {
  'test': 'http://localhost:4000',
  'staging': 'https://api.betrybe.dev',
  'homologation': 'https://api.betrybe.app',
  'production': 'https://api.betrybe.com'
}

const CONTENT_OBJECT_API_URL = apiDomains[environment] + '/lego-lms/external/v1/content_objects';

async function updateContentObjects(files, prNumber, owner, repo, actor, ref) {
  core.info(`\u001B[34m[INFO] Updating Content Objects modifield on Pull Request ${prNumber}`)

  const repository = `${owner}/${repo}`
  const payload = { files, pr_number: prNumber, repository, github_username: actor, ref }
  const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD
  const encodedUsernamePassword = Buffer.from(`squad_cursos:${basicAuthPassword}`).toString('base64')
  const headers = {'Authorization': `Basic ${encodedUsernamePassword}`}
  const batch_update_url = `${CONTENT_OBJECT_API_URL}/batch_update`

  console.log('[batch_update_url]', batch_update_url);
  console.log('[payload]', payload)

  return await axios.put(batch_update_url, payload, { headers })
    .then(async (response) => {
      console.log('[response]', response)
      core.info('\u001B[34m[INFO] Content Objects updated successfully ✓')
      return { status: response.status, data: response.data }
    })
    .catch(async (error) => ({ status: error.response.status, data: error.response.data }))
}

async function validateContentObjects(files, prNumber, owner, repo, actor, ref) {
  core.info(`\u001B[34m[INFO] Validating Content Objects modifield on Pull Request ${prNumber}`)

  const repository = `${owner}/${repo}`
  const payload = { files, repository, github_username: actor, ref }
  const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD
  const encodedUsernamePassword = Buffer.from(`squad_cursos:${basicAuthPassword}`).toString('base64')
  const headers = {'Authorization': `Basic ${encodedUsernamePassword}`}
  const validate_objects_url = `${CONTENT_OBJECT_API_URL}/validate_objects`

  return await axios.post(validate_objects_url, payload, { headers })
  .then(async (response) => {
    core.info('\u001B[34m[INFO] Content Objects validated successfully ✓')
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
    const validate = core.getInput('validate');

    console.log('[validate]', validate);

    const files = await main.downloadFiles({
      client: new github.GitHub(token),
      owner,
      repo,
      ref,
      prNumber: parseInt(prNumber),
      log: (msg) => core.info(msg),
    });

    if (validate == 'true') {
      const response = await validateContentObjects(files, prNumber, owner, repo, actor, ref)
      console.log('response', JSON.stringify(response.data.errors))
      console.log('typeof response', (typeof response.data.errors))

      if (response.status == 422 && (typeof response.data.errors == 'undefined')) {
        core.setOutput('errors', []);
        core.setOutput('validation_failed', true);

        // A linha abaixo é responsável por travar o Pull Request
        core.setFailed(`[ERROR] Failed to validate Content Objects: ${JSON.stringify(response)}`)
      } else if (response.status != 200) {
        core.setOutput('errors', response.data.errors);
        core.setOutput('validation_failed', false);

        // A linha abaixo é responsável por travar o Pull Request
        core.setFailed(`[ERROR] Failed to validate Content Objects: ${JSON.stringify(response)}`)
      } else {
        core.setOutput('errors', []);
        core.setOutput('validation_failed', false);
      }
    } else {
      const response = await updateContentObjects(files, prNumber, owner, repo, actor, ref)

      if (response.status != 200) {
        core.setOutput('errors', response.data.errors);
        core.setFailed(`[ERROR] Failed to update Content Objects: ${JSON.stringify(response)}`)
      }
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run();
