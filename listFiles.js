const listFiles = async (options) => {
  const {
    client,
    owner,
    repo,
    prNumber,
    storagePath,
    log
  } = options;

  const { data: files } = await client.pulls.listFiles();
  return files.map(file => file.filename);
};

module.exports = listFiles;
