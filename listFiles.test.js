const listFiles = require('./listFiles');

const client = {
  pulls: {
    listFiles: jest.fn()
  }
};

const run = (storagePath = 'tmp/convert', filterPath = '') => {
  return listFiles({
    client,
    owner: 'my-org',
    repo: 'my-repo',
    prNumber: 1,
    storagePath,
    filterPath,
    log: () => {},
  });
};

describe('listFiles', () => {
  it('list files', async () => {
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
    expect(filenames).toEqual(expect.arrayContaining(expected));
  });
});
