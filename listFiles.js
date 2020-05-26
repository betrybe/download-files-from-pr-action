const listFiles = (options) => {
  const {
    client,
    owner,
    repo,
    prNumber,
    storagePath,
    log
  } = options;

  console.log(options);
};

module.exports = listFiles;
