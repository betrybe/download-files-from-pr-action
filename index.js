const core = require('@actions/core');
const github = require('@actions/github');
const listFiles = require('./listFiles');

async function run() {
  try {
    const token = core.getInput('token', { required: true });
    const owner = core.getInput('owner') || github.context.repo.owner;
    const repo = core.getInput('repo') || github.context.repo.repo;
    const prNumber = core.getInput('prNumber', { required: true });
    const storagePath = core.getInput('storagePath', { required: true });

    await listFiles({
      client: new github.GitHub(token),
      owner,
      repo,
      prNumber: parseInt(prNumber),
      storagePath,
      log: (msg) => core.info(msg),
    });
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run();
