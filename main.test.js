const fs = require('fs');
const main = require('./main');

const client = {
  pulls: {
    listFiles: jest.fn()
  },
  repos: {
    getContents: jest.fn()
  }
};

const runListFiles = (filterPath = '') => {
  return main.listFiles({
    client,
    owner: 'my-org',
    repo: 'my-repo',
    prNumber: 1,
    filterPath,
    log: () => {},
  });
};

const runDownloadFile = (storagePath = 'tmp/convert') => {
  return main.downloadFile({
    client,
    owner: 'my-org',
    repo: 'my-repo',
    ref: 'b83924d03941d253d388e688fdad178f8f727112',
    storagePath,
    filename: 'content/meu-arquivo.md',
    log: () => {},
  });
};

const runDownloadFiles = (filterPath = '', storagePath = 'tmp/convert') => {
  return main.downloadFiles({
    client,
    owner: 'my-org',
    repo: 'my-repo',
    ref: 'b83924d03941d253d388e688fdad178f8f727112',
    prNumber: 1,
    storagePath,
    filterPath,
    log: () => {},
  });
};

describe('Main', () => {
  beforeEach(() => {
    fs.rmdirSync('tmp', { recursive: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('list all files from Pull Request', async () => {
    client.pulls.listFiles.mockResolvedValue({
      data: [{
        filename: 'README.md',
        status: 'modified',
      }, {
        filename: 'content/meu-arquivo.md',
        status: 'added',
      }, {
        filename: 'wait.js',
        status: 'removed',
      }]
    });
    const expected = [
      'README.md',
      'content/meu-arquivo.md',
      'wait.js',
    ];
    const filenames = await runListFiles();
    expect(client.pulls.listFiles).toHaveBeenCalled();
    expect(filenames).toEqual(expected);
  });

  it('list filtered files from Pull Request', async () => {
    client.pulls.listFiles.mockResolvedValue({
      data: [{
        filename: 'README.md',
        status: 'modified',
      }, {
        filename: 'content/meu-arquivo.md',
        status: 'added',
      }, {
        filename: 'wait.js',
        status: 'removed',
      }]
    });
    const expected = [
      'content/meu-arquivo.md',
    ];
    const filenames = await runListFiles('content/');
    expect(filenames).toEqual(expected);
  });

  it('download file', async () => {
    client.repos.getContents.mockResolvedValue({
      data: {
        name: 'meu-arquivo.md',
        path: 'content/meu-arquivo.md',
        type: 'file',
        content: 'YmxhYmxhYmxhCg==\n',
        encoding: 'base64',
      }
    });
    await runDownloadFile();
    expect(client.repos.getContents).toHaveBeenCalled();
    const file = fs.readFileSync('tmp/convert/content/meu-arquivo.md');
    expect('blablabla\n').toBe(file.toString());
  });

  it('download file in specific directory', async () => {
    client.repos.getContents.mockResolvedValue({
      data: {
        name: 'meu-arquivo.md',
        path: 'content/meu-arquivo.md',
        type: 'file',
        content: 'YmxhYmxhYmxhCg==\n',
        encoding: 'base64',
      }
    });
    await runDownloadFile('tmp/specific/convert');
    expect(client.repos.getContents).toHaveBeenCalled();
    const file = fs.readFileSync('tmp/specific/convert/content/meu-arquivo.md');
    expect('blablabla\n').toBe(file.toString());
  });

  it('download many files inside same directory', async () => {
    client.repos.getContents
      .mockResolvedValueOnce({
        data: {
          name: 'meu-arquivo.md',
          path: 'content/meu-arquivo.md',
          type: 'file',
          content: 'YmxhYmxhYmxhCg==\n',
          encoding: 'base64',
        }
      })
      .mockResolvedValueOnce({
        data: {
          name: 'meu-arquivo.md',
          path: 'content/my/outro-arquivo.md',
          type: 'file',
          content: 'YmxhYmxhYmxhCg==\n',
          encoding: 'base64',
        }
      }
    );
    await runDownloadFile();
    await runDownloadFile();
    expect(client.repos.getContents).toHaveBeenCalledTimes(2);
    const file1 = fs.readFileSync('tmp/convert/content/meu-arquivo.md');
    expect('blablabla\n').toBe(file1.toString());
    const file2 = fs.readFileSync('tmp/convert/content/my/outro-arquivo.md');
    expect('blablabla\n').toBe(file2.toString());
  });

  it('download files from pull request', async () => {
    client.pulls.listFiles.mockResolvedValue({
      data: [{
        filename: 'README.md',
        status: 'modified',
      }, {
        filename: 'content/meu-arquivo.md',
        status: 'added',
      }]
    });
    client.repos.getContents
      .mockResolvedValueOnce({
        data: {
          name: 'README.md',
          path: 'README.md',
          type: 'file',
          content: 'YmxhYmxhYmxhCg==\n',
          encoding: 'base64',
        }
      })
      .mockResolvedValueOnce({
        data: {
          name: 'meu-arquivo.md',
          path: 'content/meu-arquivo.md',
          type: 'file',
          content: 'YmxhYmxhYmxhCg==\n',
          encoding: 'base64',
        }
      }
    );
    await runDownloadFiles();
    expect(client.pulls.listFiles).toHaveBeenCalled();
    expect(client.repos.getContents).toHaveBeenCalledTimes(2);
    const file1 = fs.readFileSync('tmp/convert/README.md');
    expect('blablabla\n').toBe(file1.toString());
    const file2 = fs.readFileSync('tmp/convert/content/meu-arquivo.md');
    expect('blablabla\n').toBe(file2.toString());
  });

  it('download filtered files from pull request', async () => {
    client.pulls.listFiles.mockResolvedValue({
      data: [{
        filename: 'README.md',
        status: 'modified',
      }, {
        filename: 'content/meu-arquivo.md',
        status: 'added',
      }]
    });
    client.repos.getContents
      .mockResolvedValueOnce({
        data: {
          name: 'meu-arquivo.md',
          path: 'content/meu-arquivo.md',
          type: 'file',
          content: 'YmxhYmxhYmxhCg==\n',
          encoding: 'base64',
        }
      }
    );
    await runDownloadFiles('content/');
    expect(client.pulls.listFiles).toHaveBeenCalled();
    expect(client.repos.getContents).toHaveBeenCalled();
    const file1 = fs.readFileSync('tmp/convert/content/meu-arquivo.md');
    expect('blablabla\n').toBe(file1.toString());
  });

  it('download files from pull request in specific directory', async () => {
    client.pulls.listFiles.mockResolvedValue({
      data: [{
        filename: 'README.md',
        status: 'modified',
      }, {
        filename: 'content/meu-arquivo.md',
        status: 'added',
      }]
    });
    client.repos.getContents
      .mockResolvedValueOnce({
        data: {
          name: 'README.md',
          path: 'README.md',
          type: 'file',
          content: 'YmxhYmxhYmxhCg==\n',
          encoding: 'base64',
        }
      })
      .mockResolvedValueOnce({
        data: {
          name: 'meu-arquivo.md',
          path: 'content/meu-arquivo.md',
          type: 'file',
          content: 'YmxhYmxhYmxhCg==\n',
          encoding: 'base64',
        }
      }
    );
    await runDownloadFiles('', 'tmp/convert/other');
    expect(client.pulls.listFiles).toHaveBeenCalled();
    expect(client.repos.getContents).toHaveBeenCalledTimes(2);
    const file1 = fs.readFileSync('tmp/convert/other/README.md');
    expect('blablabla\n').toBe(file1.toString());
    const file2 = fs.readFileSync('tmp/convert/other/content/meu-arquivo.md');
    expect('blablabla\n').toBe(file2.toString());
  });
});
