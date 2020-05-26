const listFiles = async (options) => {
  const {
    client,
    owner,
    repo,
    prNumber,
    storagePath,
    log
  } = options;

  console.log(options);
  console.log(await client.pulls.listFiles());
};

module.exports = listFiles;
