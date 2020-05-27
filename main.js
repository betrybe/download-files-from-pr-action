const listFiles = async (options) => {
  const {
    client,
    owner,
    repo,
    ref,
    prNumber,
    storagePath,
    filterPath,
    log
  } = options;

  const { data: files } = await client.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
    per_page: 100,
    page: 1,
  });
  return files
    .filter(({ filename }) => filename.includes(filterPath))
    .map(({ filename }) => filename);
};

module.exports = {
  listFiles,
};
