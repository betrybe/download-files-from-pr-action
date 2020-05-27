const listFiles = async (options) => {
  const {
    client,
    owner,
    repo,
    prNumber,
    storagePath,
    filterPath,
    log
  } = options;

  const { data: files } = await client.pulls.listFiles();
  return files
    .filter(({ filename }) => filename.includes(filterPath))
    .map(({ filename }) => filename);
};

module.exports = {
  listFiles,
};
