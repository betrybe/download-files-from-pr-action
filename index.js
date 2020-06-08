const core = require('@actions/core');
const github = require('@actions/github');
const main = require('./main');

async function run() {
  try {
    const token = core.getInput('token', { required: true });
    const owner = core.getInput('owner') || github.context.repo.owner;
    const repo = core.getInput('repo') || github.context.repo.repo;
    const ref = core.getInput('ref') || github.context.sha;
    const prNumber = core.getInput('prNumber', { required: true });
    const storagePath = core.getInput('storagePath', { required: true });
    const filterPath = core.getInput('filterPath') || '';

    await main.downloadFiles({
      client: new github.GitHub(token),
      owner,
      repo,
      ref,
      prNumber: parseInt(prNumber),
      storagePath,
      filterPath,
      log: (msg) => core.info(msg),
    });

    const removedFilenames = await main.listRemovedFiles({
      client: new github.GitHub(token),
      owner,
      repo,
      prNumber: parseInt(prNumber),
      log: (msg) => core.info(msg),
    });

    core.setOutput('encodedRemovedFilenames', main.arrayToBase64(removedFilenames));
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run();
