const path = require('path');
const fs = require('fs');

const listFilesFromPR = async (options) => {
  const {
    client,
    owner,
    repo,
    prNumber,
  } = options;

  let firstOrHasNext = true;
  let files = [];
  let per_page = 100;
  let page = 1;

  while (firstOrHasNext) {
    const { data } = await client.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
      per_page,
      page,
    });

    if (data.length > 0) {
      files.push(...data);
      page += 1;
    } else {
      firstOrHasNext = false;
    }
  }
  return files;
};

const listFiles = async (options) => {
  const {
    client,
    owner,
    repo,
    prNumber,
    filterPath,
    log
  } = options;

  const files = await listFilesFromPR({
    client,
    owner,
    repo,
    prNumber,
  });

  return files
    .filter(({ filename, status }) => filename.includes(filterPath) && status !== 'removed')
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
    ref,
    mediaType: {
      format: "raw"
    }
  });
  const localPath = path.join(storagePath, filename);
  const { dir } = path.parse(localPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (file.encoding != 'none') {
    fs.writeFileSync(localPath, file.content, file.encoding);
  } else {
    const headers = {
      "Authorization": `Bearer ${TOKEN}`
    };

    const download = await fetch(file.download_url, { headers });
    const blob = await download.blob();
    const arrayBuffer = await blob.arrayBuffer();

    fs.writeFileSync(localPath, Buffer.from(arrayBuffer));
  }
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

const listRemovedFiles = async (options) => {
  const {
    client,
    owner,
    repo,
    prNumber,
    log
  } = options;

  const files = await listFilesFromPR({
    client,
    owner,
    repo,
    prNumber,
  });

  return files
    .filter(({ status }) => status === 'removed')
    .map(({ filename }) => filename);
};

const arrayToBase64 = (array) => {
  return Buffer.from(array.join(',')).toString('base64');
};

module.exports = {
  listFiles,
  downloadFile,
  downloadFiles,
  listRemovedFiles,
  arrayToBase64,
};
