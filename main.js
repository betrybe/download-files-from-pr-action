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
  } = options;

  const files = await listFilesFromPR({
    client,
    owner,
    repo,
    prNumber,
  });

  return files
    .filter(({ status }) => status !== 'removed')
    .filter(({ filename }) => filename.endsWith('index.md'))
    .map(({ filename }) => filename);
};

const downloadFile = async (options) => {
  const {
    client,
    owner,
    repo,
    ref,
    filename,
  } = options;

  const { data: file } = await client.repos.getContents({
    owner,
    repo,
    path: filename,
    ref
  });

  return {
    content: Buffer.from(file.content, file.encoding).toString(),
    filename: file.path
  }
};

const downloadFiles = async (options) => {
  const {
    client,
    owner,
    repo,
    ref,
    prNumber,
    log
  } = options;

  const filenames = await listFiles({ client, owner, repo, prNumber, log });
  return Promise.all(
    filenames.map(filename => downloadFile({ client, owner, repo, ref, filename, log }))
  );
};

const listRemovedFiles = async (options) => {
  const {
    client,
    owner,
    repo,
    prNumber,
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
