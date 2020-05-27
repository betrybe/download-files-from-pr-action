const main = require('./main');

const client = {
  pulls: {
    listFiles: jest.fn()
  }
};

const run = (storagePath = 'tmp/convert', filterPath = '') => {
  return main.listFiles({
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
    const filenames = await run();
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
    const filenames = await run('tmp', 'content/');
    expect(filenames).toEqual(expected);
  });
});
