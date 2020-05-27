const path = require('path');
const fs = require('fs');

const listFiles = async (options) => {
  const {
    client,
    owner,
    repo,
    prNumber,
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

const downloadFile = async (options) => {
  const {
    client,
    owner,
    repo,
    ref,
    storagePath,
    filename,
    log
  } = options;

  const { data: file } = await client.repos.getContents({
    owner,
    repo,
    path: filename,
    ref
  });
  const content = Buffer.from(file.content, file.encoding).toString();
  const localPath = path.join(storagePath, file.path);
  const { dir } = path.parse(localPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(localPath, content);
};

const downloadFiles = async (options) => {
  const {
    client,
    owner,
    repo,
    ref,
    prNumber,
    filterPath,
    storagePath,
    log
  } = options;

  const filenames = await listFiles({ client, owner, repo, prNumber, filterPath, log });
  return Promise.all(
    filenames.map(filename => downloadFile({ client, owner, repo, ref, storagePath, filename, log }))
  );
};

module.exports = {
  listFiles,
  downloadFile,
  downloadFiles,
};
